#include "logger.hpp"

#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>

std::once_flag Logger::once_flag_;
Logger* Logger::instance_ = nullptr;

Logger& Logger::get_instance() {
    std::call_once(once_flag_, []() {
        instance_ = new Logger();
    });
    return *instance_;
}

std::string Logger::get_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    
    std::stringstream ss;
    ss << std::put_time(std::localtime(&time_t), "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

void Logger::write_log(const std::string& level, const std::string& message) {
    std::cout << "[" << get_timestamp() << "] [" << level << "] " << message << std::endl;
}

void Logger::write_error(const std::string& level, const std::string& message) {
    std::cerr << "[" << get_timestamp() << "] [" << level << "] " << message << std::endl;
}

void Logger::log(const std::string& message) {
    get_instance().write_log("LOG", message);
}

void Logger::warn(const std::string& message) {
    get_instance().write_log("WARN", message);
}

void Logger::error(const std::string& message) {
    get_instance().write_error("ERROR", message);
}
