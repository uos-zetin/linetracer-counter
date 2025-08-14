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

struct HttpCurlClientConfig {
    bool ssl_verify = true;
    bool keep_alive = false;
};

struct HttpCurlRequest {
    std::string url;
    std::string method;
    std::vector<std::pair<std::string, std::string>> headers;
    std::vector<uint8_t> body;
    uint32_t timeout_seconds = 0;
};

class HttpCurlClient {
private:
    static bool curl_initialized_;
    CURL* curl_;
    HttpCurlClientConfig config_;

    static size_t write_callback(void* buffer, size_t size, size_t nmemb, void* userp);

    class CurlHeaderList {
    private:
        struct curl_slist* list_;
        
    public:
        CurlHeaderList() : list_(nullptr) {}
        ~CurlHeaderList() {
            if (list_) {
                curl_slist_free_all(list_);
            }
        }
        
        void append(const std::string& header) {
            list_ = curl_slist_append(list_, header.c_str());
        }
        struct curl_slist* get() const {
            return list_;
        }
        
        CurlHeaderList(const CurlHeaderList&) = delete;
        CurlHeaderList& operator=(const CurlHeaderList&) = delete;
        CurlHeaderList(CurlHeaderList&&) = delete;
        CurlHeaderList& operator=(CurlHeaderList&&) = delete;
    };

public:
    HttpCurlClient(const HttpCurlClientConfig& config = HttpCurlClientConfig());
    ~HttpCurlClient();

    HttpResponse request(const HttpCurlRequest& request);

    HttpCurlClient(const HttpCurlClient&) = delete;
    HttpCurlClient& operator=(const HttpCurlClient&) = delete;

    HttpCurlClient(HttpCurlClient&&);
    HttpCurlClient& operator=(HttpCurlClient&&);
};
