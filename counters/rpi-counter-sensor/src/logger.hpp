#pragma once

#include <string>
#include <sstream>

class Logger {
private:
    static Logger* instance_;
    
    // Private constructor for singleton
    Logger() = default;
    
    // Delete copy constructor and assignment operator
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    std::string get_timestamp();
    void write_log(const std::string& level, const std::string& message);
    void write_error(const std::string& level, const std::string& message);

public:
    static Logger& get_instance();
    
    // 기본 메서드들
    static void log(const std::string& message);
    static void warn(const std::string& message);
    static void error(const std::string& message);
    
    // 가변 인수 템플릿 메서드들
    template<typename... Args>
    static void log(Args&&... args) {
        get_instance().write_log("LOG", format_message(std::forward<Args>(args)...));
    }
    
    template<typename... Args>
    static void warn(Args&&... args) {
        get_instance().write_log("WARN", format_message(std::forward<Args>(args)...));
    }
    
    template<typename... Args>
    static void error(Args&&... args) {
        get_instance().write_error("ERROR", format_message(std::forward<Args>(args)...));
    }

private:
    // 메시지 포맷팅을 위한 헬퍼 함수
    template<typename... Args>
    static std::string format_message(Args&&... args) {
        std::stringstream ss;
        (ss << ... << std::forward<Args>(args));
        return ss.str();
    }
};
