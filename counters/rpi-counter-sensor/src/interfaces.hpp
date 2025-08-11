#pragma once

#include <vector>
#include <cstdint>
#include <string>
#include <stdexcept>

struct DeviceInfo {
    std::string device_id;
    std::string name;
    uint8_t start_threshold;
    uint8_t end_threshold;
    uint32_t end_debouncing_time; // ms
};

struct SensorDataItem {
    uint64_t timestamp;
    uint8_t front_ir;
    uint8_t back_ir;
};

class ISensorDataSender {
public:
    virtual ~ISensorDataSender() = default;
    virtual void send_sensor_data(const std::vector<SensorDataItem> &data) = 0;
};

class SenderException: public std::runtime_error {
public:
    SenderException(const std::string &message) : std::runtime_error(message) {}
};

class ISensorDataReader {
public:
    virtual ~ISensorDataReader() = default;
    virtual SensorDataItem read_sensor_data() = 0;
};

