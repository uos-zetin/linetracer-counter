#include "http_sensor_data_sender.hpp"
#include "http_curl_client.hpp"
#include "logger.hpp"

#include <nlohmann/json.hpp>

using json = nlohmann::json;

// ┌──────────────────────┐
// │ HttpSensorDataSender │
// └──────────────────────┘

std::string HttpSensorDataSender::login(const std::string& username, const std::string& password) {
    try {
        json body_json = {
            { "username", username },
            { "password", password }
        };
        std::string body_str = body_json.dump();

        HttpResponse res = client_.request(HttpCurlRequest{
            .url = api_base_url_ + "/actors/login",
            .method = "POST",
            .headers = {
                { "Content-Type", "application/json" }
            },
            .body = std::vector<uint8_t>(body_str.begin(), body_str.end()),
            .timeout_seconds = api_http_timeout_,
        });

        if (res.is_ok()) {
            return res.get_text();
        } else {
            throw SenderException("Failed to login: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to login: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::logout() {
    try {
        HttpResponse res = client_.request(HttpCurlRequest{
            .url = api_base_url_ + "/actors/logout",
            .method = "POST",
            .headers = {
                { "Authorization", "Session " + session_key_ }
            },
            .timeout_seconds = api_http_timeout_,
        });

        if (!res.is_ok()) {
            throw SenderException("Failed to logout: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to logout: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::register_device(const DeviceInfo& device_info) {    
    try {
        json body_json = {
            { "deviceId", device_info.device_id },
            { "name", device_info.name },
            { "startThreshold", device_info.start_threshold },
            { "endThreshold", device_info.end_threshold },
            { "endDebouncingTime", device_info.end_debouncing_time }
        };
        std::string body_str = body_json.dump();

        HttpResponse res = client_.request(HttpCurlRequest{
            .url = api_base_url_ + "/counters/front-back-ir/register",
            .method = "POST",
            .headers = {
                { "Content-Type", "application/json" },
                { "Authorization", "Session " + session_key_ }
            },
            .body = std::vector<uint8_t>(body_str.begin(), body_str.end()),
            .timeout_seconds = api_http_timeout_,
        });

        if (!res.is_ok()) {
            throw SenderException("Failed to register device: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to register device: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::unregister_device(const std::string& device_id) {
    try {
        HttpResponse res = client_.request(HttpCurlRequest{
            .url = api_base_url_ + "/counters/" + device_id,
            .method = "DELETE",
            .headers = {
                { "Authorization", "Session " + session_key_ }
            },
            .timeout_seconds = api_http_timeout_,
        });

        if (!res.is_ok()) {
            throw SenderException("Failed to unregister device: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to unregister device: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::send_data(const std::string& device_id, const std::vector<SensorDataItem>& data) {
    try {
        json data_json = json::array();
        for (const auto &item : data) {
            data_json.push_back({ item.timestamp, item.front_ir, item.back_ir });
        }
        json body_json = {
            { "data", data_json }
        };
        std::string body_str = body_json.dump();

        HttpResponse res = client_.request(HttpCurlRequest{
            .url = api_base_url_ + "/counters/front-back-ir/" + device_id + "/data",
            .method = "PUT",
            .headers = {
                { "Content-Type", "application/json" },
                { "Authorization", "Session " + session_key_ }
            },
            .body = std::vector<uint8_t>(body_str.begin(), body_str.end()),
            .timeout_seconds = api_http_timeout_,
        });

        if (!res.is_ok()) {
            throw SenderException("Failed to send data: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to send data: " + std::string(e.what()));
    }
}

HttpSensorDataSender::HttpSensorDataSender(
    const std::string& api_base_url,
    const std::string& username,
    const std::string& password,
    const uint32_t api_http_timeout,
    const DeviceInfo& device_info
) : api_base_url_(api_base_url),
    username_(username),
    password_(password),
    api_http_timeout_(api_http_timeout),
    device_info_(device_info) {
    client_ = std::move(HttpCurlClient(HttpCurlClientConfig{
        .ssl_verify = true,
        .keep_alive = true,
    }));
}

HttpSensorDataSender::~HttpSensorDataSender() {
    if (!session_key_.empty()) {
        logout();
    }
}

void HttpSensorDataSender::ensure_connect(bool reconnect) {
    if (session_key_.empty() || reconnect) {
        Logger::log("ensure_connect: try to login...");
        session_key_ = login(username_, password_);
        Logger::log("ensure_connect: login success");
    }
    if (!registered_device_ || reconnect) {
        Logger::log("ensure_connect: try to register device...");
        register_device(device_info_);
        registered_device_ = true;
        Logger::log("ensure_connect: register device success");
    }
}

void HttpSensorDataSender::send_sensor_data(const std::vector<SensorDataItem>& data) {
    try {
        if (have_to_reconnect_) {
            have_to_reconnect_ = false;
            ensure_connect(true);
        }
        send_data(device_info_.device_id, data);
    } catch (const SenderException& e) {
        have_to_reconnect_ = true;
        throw;
    }
}
