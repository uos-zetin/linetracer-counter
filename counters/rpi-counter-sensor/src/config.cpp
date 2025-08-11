#include "config.hpp"

#include <fstream>
#include <stdexcept>
#include <nlohmann/json.hpp>

Config Config::load_from_file(const std::string& file_path) {
    std::ifstream file(file_path);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open config file: " + file_path);
    }
    
    nlohmann::json j;
    file >> j;
    
    Config config;
    
    config.device_id = j["device_id"];
    config.device_name = j["device_name"];
    config.sensor_start_threshold = j["sensor_start_threshold"];
    config.sensor_end_threshold = j["sensor_end_threshold"];
    config.sensor_end_debouncing_time = j["sensor_end_debouncing_time"];
    
    config.spi_device_path = j["spi_device_path"];
    
    config.api_base_url = j["api_base_url"];
    config.api_username = j["api_username"];
    config.api_password = j["api_password"];
    
    return config;
}
