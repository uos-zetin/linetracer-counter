#include "config.hpp"
#include "logger.hpp"
#include "interfaces.hpp"
#include "thread_safe_queue.hpp"
#include "http_sensor_data_sender.hpp"
#include "bpw34_sensor_data_reader.hpp"

#include <chrono>
#include <thread>
#include <signal.h>
#include <cstdlib>
#include <cstring>

volatile sig_atomic_t keep_running = 1;

void signal_handler(int signum) {
    keep_running = 0;
}

void thread_read_sensor_data(ISensorDataReader& reader, ThreadSafeQueue<SensorDataItem>& queue) {
    Logger::log("start reading sensor data");

    auto next_read_time = std::chrono::steady_clock::now();
    const auto read_interval = std::chrono::milliseconds(1);
    const auto check_interval = std::chrono::microseconds(100);

    while (keep_running) {
        auto current_time = std::chrono::steady_clock::now();

        // 1ms 샘플링 주기에 도달했는지 확인
        if (next_read_time <= current_time) {
            SensorDataItem data = reader.read_sensor_data();
            queue.push(std::move(data));
            
            // 다음 읽기 시간을 정확히 1ms 후로 설정
            next_read_time = next_read_time + read_interval;

            // 만약 현재 시간이 다음 읽기 시간보다 많이 앞서있다면 조정
            if (current_time > next_read_time) {
                next_read_time = current_time + read_interval;
            }
        }

        // 100us 주기로 체크하되, 다음 읽기 시간까지 남은 시간을 고려
        auto time_until_next_read = next_read_time - current_time;
        auto sleep_duration = (check_interval < time_until_next_read) ? check_interval : time_until_next_read;

        if (sleep_duration > std::chrono::microseconds(0)) {
            std::this_thread::sleep_for(sleep_duration);
        }
    }

    Logger::log("end reading sensor data");
}

void thread_send_sensor_data(ISensorDataSender& sender, ThreadSafeQueue<SensorDataItem>& queue) {
    Logger::log("start sending sensor data");

    std::vector<SensorDataItem> batch_data;
    batch_data.reserve(1000);

    auto last_send_time = std::chrono::steady_clock::now();
    const auto batch_interval = std::chrono::seconds(1); // 1초 단위로 데이터 전송
    const auto timeout = std::chrono::seconds(1);

    while (keep_running) {
        SensorDataItem data;
        if (!queue.pop(data, timeout)) {
            continue;
        }
        batch_data.push_back(std::move(data));

        auto current_time = std::chrono::steady_clock::now();
        if (current_time - last_send_time >= batch_interval) {
            // 1초 단위로 데이터 전송
            if (!batch_data.empty()) {
                size_t size = batch_data.size();
                try {
                    // 데이터 전송 시도
                    sender.send_sensor_data(batch_data);
                    Logger::log("Sent ", size, " data");
                } catch (const SenderException& e) {
                    Logger::error("Error sending sensor data: ", e.what());
                }
                batch_data.clear();
                last_send_time = current_time;
            }
        }
    }

    Logger::log("end sending sensor data");
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
    ThreadSafeQueue<SensorDataItem> queue(10000);

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
