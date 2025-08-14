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
        json request_body = {
            { "username", username },
            { "password", password }
        };

        HttpCurlClient client;
        HttpResponse res = client
            .set_url(api_base_url_ + "/actors/login")
            .set_method("POST")
            .set_headers({
                { "Content-Type", "application/json" }
            })
            .set_body(request_body.dump())
            .set_timeout(api_http_timeout_, api_http_timeout_)
            .execute();
        
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
        HttpCurlClient client;
        HttpResponse res = client
            .set_url(api_base_url_ + "/actors/logout")
            .set_method("POST")
            .set_headers({
                { "Authorization", "Session " + session_key_ }
            })
            .set_timeout(api_http_timeout_, api_http_timeout_)
            .execute();

        if (!res.is_ok()) {
            throw SenderException("Failed to logout: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to logout: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::register_device(const DeviceInfo& device_info) {    
    try {
        json request_body = {
            { "deviceId", device_info.device_id },
            { "name", device_info.name },
            { "startThreshold", device_info.start_threshold },
            { "endThreshold", device_info.end_threshold },
            { "endDebouncingTime", device_info.end_debouncing_time }
        };

        HttpCurlClient client;
        HttpResponse res = client
            .set_url(api_base_url_ + "/counters/front-back-ir/register")
            .set_method("POST")
            .set_headers({
                { "Content-Type", "application/json" },
                { "Authorization", "Session " + session_key_ }
            })
            .set_body(request_body.dump())
            .set_timeout(api_http_timeout_, api_http_timeout_)
            .execute();

        if (!res.is_ok()) {
            throw SenderException("Failed to register device: " + res.get_text());
        }
    } catch (const CurlException& e) {
        throw SenderException("Failed to register device: " + std::string(e.what()));
    }
}

void HttpSensorDataSender::unregister_device(const std::string& device_id) {
    try {
        HttpCurlClient client;
        HttpResponse res = client
            .set_url(api_base_url_ + "/counters/" + device_id)
            .set_method("DELETE")
            .set_headers({
                { "Authorization", "Session " + session_key_ }
            })
            .set_timeout(api_http_timeout_, api_http_timeout_)
            .execute();

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
        json request_body = {
            { "data", data_json }
        };

        HttpCurlClient client;
        HttpResponse res = client
            .set_url(api_base_url_ + "/counters/front-back-ir/" + device_id + "/data")
            .set_method("PUT")
            .set_headers({
                { "Content-Type", "application/json" },
                { "Authorization", "Session " + session_key_ }
            })
            .set_body(request_body.dump())
            .set_timeout(api_http_timeout_, api_http_timeout_)
            .execute();

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
): api_base_url_(api_base_url)
    , username_(username)
    , password_(password)
    , api_http_timeout_(api_http_timeout)
    , device_info_(device_info) {}

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
