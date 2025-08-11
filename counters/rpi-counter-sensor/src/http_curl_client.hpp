#pragma once

#include <curl/curl.h>
#include <vector>
#include <string>
#include <cstdint>
#include <stdexcept>

class HttpResponse {
private:
    int status_code_;
    std::vector<uint8_t> data_;

public:
    HttpResponse(int status_code, const std::vector<uint8_t>& data);

    int get_status_code() const;
    const std::vector<uint8_t>& get_data() const;
    std::string get_text() const;
    bool is_ok() const;
};

class CurlException: public std::runtime_error {
private:
    CURLcode curl_code_;
    std::string url_;

public:
    CurlException(const std::string& message, CURLcode curl_code, const std::string& url);

    CURLcode get_error_code() const;
    const std::string& get_url() const;
};

class HttpCurlClient {
private:
    static bool curl_initialized_;
    CURL* curl_;
    struct curl_slist* header_list_;
    std::vector<uint8_t> response_data_;
    long http_status_code_;
    std::string current_url_;

    static size_t write_callback(void* buffer, size_t size, size_t nmemb, void* userp);

public:
    HttpCurlClient(bool ssl_verify = true);
    ~HttpCurlClient();

    HttpCurlClient& reset();
    HttpCurlClient& set_url(const std::string& url);
    HttpCurlClient& set_method(const std::string& method);
    HttpCurlClient& set_headers(const std::vector<std::pair<std::string, std::string>>& headers);
    HttpCurlClient& set_body(const std::string& body);
    HttpCurlClient& set_timeout(int timeout_seconds, int connect_timeout_seconds);
    HttpResponse execute();

    HttpCurlClient(const HttpCurlClient&) noexcept = delete;
    HttpCurlClient& operator=(const HttpCurlClient&) noexcept = delete;

    HttpCurlClient(HttpCurlClient&&) noexcept = delete;
    HttpCurlClient& operator=(HttpCurlClient&&) noexcept = delete;
};
