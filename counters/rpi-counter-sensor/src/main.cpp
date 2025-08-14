#include "config.hpp"
#include "logger.hpp"
#include "interfaces.hpp"
#include "thread_safe_queue.hpp"
#include "precision_timer.hpp"
#include "http_sensor_data_sender.hpp"
#include "bpw34_sensor_data_reader.hpp"

#include <chrono>
#include <thread>
#include <signal.h>
#include <cstdlib>
#include <cstring>
#include <atomic>

std::atomic<bool> keep_running = true;

void signal_handler(int signum) {
    keep_running = false;
}

void thread_read_sensor_data(ISensorDataReader& reader, ThreadSafeQueue<SensorDataItem>& queue) {
    PrecisionTimer timer(std::chrono::milliseconds(1));

    auto last_log_time = std::chrono::steady_clock::now();
    const auto log_interval = std::chrono::seconds(2);
    int log_read_count = 0;

    while (keep_running) {
        // 센서 데이터 읽기
        SensorDataItem data = reader.read_sensor_data();

        // 데이터 큐에 저장
        queue.push(data);
        log_read_count++;

        // 다음 읽기 시간 대기
        timer.wait_for_next_cycle();

        // 로그 출력
        const auto log_elapsed_time = std::chrono::steady_clock::now() - last_log_time;
        if (log_elapsed_time >= log_interval) {
            double avg_read_count = (double)log_read_count / std::chrono::duration_cast<std::chrono::seconds>(log_elapsed_time).count();
            Logger::log(
                "Avg read count: ", avg_read_count, " items/s",
                ", Avg jitter: ", timer.get_average_jitter(), " us");
            last_log_time = std::chrono::steady_clock::now();
            log_read_count = 0;
        }
    }
}

void thread_send_sensor_data(ISensorDataSender& sender, ThreadSafeQueue<SensorDataItem>& queue) {
    PrecisionTimer timer(std::chrono::milliseconds(250));
    
    auto last_log_time = std::chrono::steady_clock::now();
    const auto log_interval = std::chrono::seconds(2);
    int log_send_count = 0;

    while (keep_running) {
        // 데이터 배치 가져오기
        auto data_batch = queue.pop_all();

        // 데이터 전송
        if (!data_batch.empty()) {
            try {
                sender.send_sensor_data(data_batch);
                log_send_count += data_batch.size();
            } catch (const std::exception& e) {
                Logger::error("Error sending sensor data: ", e.what());
                std::this_thread::sleep_for(std::chrono::seconds(1));
            }
        }

        // 다음 전송 시간 대기
        timer.wait_for_next_cycle();

        // 로그 출력
        const auto log_elapsed_time = std::chrono::steady_clock::now() - last_log_time;
        if (log_elapsed_time >= log_interval) {
            double avg_send_count = (double)log_send_count / std::chrono::duration_cast<std::chrono::seconds>(log_elapsed_time).count();
            Logger::log("Avg send count: ", avg_send_count, " items/s"
                ", Avg jitter: ", timer.get_average_jitter() / 1000.0, " ms");
            last_log_time = std::chrono::steady_clock::now();
            log_send_count = 0;
        }
    }
}

int main(int argc, char* argv[]) {
    std::string config_file = "config.json";

    // 명령줄 인수 파싱
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-c") == 0 || strcmp(argv[i], "--config") == 0) {
            if (i + 1 < argc) {
                config_file = argv[i + 1];
                i++;
            } else {
                Logger::error("Error: -c/--config requires a configuration file path");
                return 1;
            }
        }
    }

    // 시그널 핸들러 등록
    signal(SIGTERM, signal_handler);
    signal(SIGINT, signal_handler);

    // 설정 로드
    Config config;
    try {
        config = Config::load_from_file(config_file);
        Logger::log("Loaded configuration from: ", config_file);
    } catch (const std::exception& e) {
        Logger::error("Error loading config file: ", e.what());
        return 1;
    }

    DeviceInfo device_info = {
        .device_id = config.device_id,
        .name = config.device_name,
        .start_threshold = config.sensor_start_threshold,
        .end_threshold = config.sensor_end_threshold,
        .end_debouncing_time = config.sensor_end_debouncing_time
    };
    HttpSensorDataSender sender(
        config.api_base_url,
        config.api_username,
        config.api_password,
        device_info
    );

    Bpw34SensorDataReader reader(config.spi_device_path);
    ThreadSafeQueue<SensorDataItem> queue;

    std::thread read_thread(thread_read_sensor_data, std::ref(reader), std::ref(queue));
    std::thread send_thread(thread_send_sensor_data, std::ref(sender), std::ref(queue));

    // systemd 서비스로 실행될 때는 시그널을 기다림
    while (keep_running) {
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    // 스레드 종료 대기
    if (read_thread.joinable()) {
        read_thread.join();
    }
    if (send_thread.joinable()) {
        send_thread.join();
    }

    return 0;
}
