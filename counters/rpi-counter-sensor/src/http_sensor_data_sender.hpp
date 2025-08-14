#pragma once

#include "interfaces.hpp"
#include <string>
#include <vector>

struct HttpSensorDataSenderActor {
    std::string id;
    std::string name;
    std::vector<std::string> roles;
};

class HttpSensorDataSender : public ISensorDataSender {
private:
    std::string username_;
    std::string password_;
    std::string api_base_url_;
    uint32_t api_http_timeout_; // seconds

    DeviceInfo device_info_;
    std::string session_key_;
    bool registered_device_ = false;

    bool have_to_reconnect_ = false;

    std::string login(const std::string& username, const std::string& password);
    void logout();
    void register_device(const DeviceInfo& device_info);
    void unregister_device(const std::string& device_id);
    void send_data(const std::string& device_id, const std::vector<SensorDataItem>& data);

public:
    HttpSensorDataSender(
        const std::string& api_base_url,
        const std::string& username,
        const std::string& password,
        const uint32_t api_http_timeout,
        const DeviceInfo& device_info
    );

    ~HttpSensorDataSender();

    void ensure_connect(bool reconnect = false);
    void send_sensor_data(const std::vector<SensorDataItem>& data) override;
};
