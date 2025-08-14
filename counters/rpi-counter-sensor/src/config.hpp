#pragma once

#include <string>
#include <cstdint>

struct Config {
    std::string device_id;
    std::string device_name;

    uint8_t sensor_start_threshold;
    uint8_t sensor_end_threshold;
    uint32_t sensor_end_debouncing_time; // ms

    std::string spi_device_path;

    std::string api_base_url;
    std::string api_username;
    std::string api_password;
    uint32_t api_http_timeout; // seconds
    
    static Config load_from_file(const std::string& file_path);
};
