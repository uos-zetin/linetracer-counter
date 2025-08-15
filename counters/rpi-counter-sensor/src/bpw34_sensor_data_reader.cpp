#include "bpw34_sensor_data_reader.hpp"

#include <chrono>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/spi/spidev.h>
#include <algorithm>

// ┌───────────────────────┐
// │ Bpw34SensorDataReader │
// └───────────────────────┘

void Bpw34SensorDataReader::initialize_spi(const std::string& spi_dev_path) {
    spi_fd_ = open(spi_dev_path.c_str(), O_RDWR);
    if (spi_fd_ == -1) {
        throw std::runtime_error("Failed to open SPI device: " + spi_dev_path);
    }

    spi_mode_ = SPI_MODE_0;
    spi_bits_ = 8;
    spi_speed_ = 1000000; // 1MHz

    if (ioctl(spi_fd_, SPI_IOC_WR_MODE, &spi_mode_) == -1) {
        throw std::runtime_error("Failed to set SPI mode");
    }
    if (ioctl(spi_fd_, SPI_IOC_WR_BITS_PER_WORD, &spi_bits_) == -1) {
        throw std::runtime_error("Failed to set SPI bits per word");
    }
    if (ioctl(spi_fd_, SPI_IOC_WR_MAX_SPEED_HZ, &spi_speed_) == -1) {
        throw std::runtime_error("Failed to set SPI speed");
    }
}

uint16_t Bpw34SensorDataReader::read_adc(int channel) {
    if (channel < 0 || channel > 7) {
        throw std::invalid_argument("Invalid channel number");
    }

    /**
     * SCLK |  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
     * DIN  |  - |  - |  - |  - |  - |  - |  - |  H |  H | D2 | D1 | D0 |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |
     * DOUT |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  - |  0 | B9 | B8 | B7 | B6 | B5 | B4 | B3 | B2 | B1 | B0 |
     * CS   | 데이터 전송 시작 시 Low, 데이터 전송 완료 시 High
     *
     * `-`는 상관 쓰지 않는 부분을 의미함.
     */
    uint8_t tx_buf[3] = {
        0x01,
        static_cast<uint8_t>((0x08 + channel) << 4),
        0x00
    };
    uint8_t rx_buf[3];

    struct spi_ioc_transfer transfer = {
        .tx_buf = (unsigned long)tx_buf,
        .rx_buf = (unsigned long)rx_buf,
        .len = 3,
        .speed_hz = spi_speed_,
        .bits_per_word = spi_bits_,
        .cs_change = 0,
    };

    if (ioctl(spi_fd_, SPI_IOC_MESSAGE(1), &transfer) < 0) {
        throw std::runtime_error("Failed to transfer data");
    }

    uint16_t adc_value = ((rx_buf[1] & 0x03) << 8) + rx_buf[2];
    return adc_value;
}

Bpw34SensorDataReader::Bpw34SensorDataReader(const std::string& spi_dev_path) {
    initialize_spi(spi_dev_path);
}

Bpw34SensorDataReader::~Bpw34SensorDataReader() {
    close(spi_fd_);
}

SensorDataItem Bpw34SensorDataReader::read_sensor_data() {
    uint64_t timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count();
    uint16_t sensor_data_raw[4] = {
        read_adc(0),
        read_adc(1),
        read_adc(2),
        read_adc(3)
    };

    uint8_t front_ir = static_cast<uint8_t>(
        std::max(sensor_data_raw[0], sensor_data_raw[1]) >> 2
    );
    uint8_t back_ir = static_cast<uint8_t>(
        std::max(sensor_data_raw[2], sensor_data_raw[3]) >> 2
    );

    return SensorDataItem{
        .timestamp = timestamp,
        .front_ir = front_ir,
        .back_ir = back_ir
    };
}
