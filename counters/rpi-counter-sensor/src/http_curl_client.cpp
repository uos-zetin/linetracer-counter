#include "http_curl_client.hpp"

// ┌──────────────┐
// │ HttpResponse │
// └──────────────┘

HttpResponse::HttpResponse(int status_code, const std::vector<uint8_t>& data)
    : status_code_(status_code), data_(data) {}

int HttpResponse::get_status_code() const {
    return status_code_;
}

const std::vector<uint8_t>& HttpResponse::get_data() const {
    return data_;
}

std::string HttpResponse::get_text() const {
    return std::string(data_.begin(), data_.end());
}

bool HttpResponse::is_ok() const {
    return status_code_ >= 200 && status_code_ < 300;
}

// ┌───────────────────┐
// │ HttpCurlException │
// └───────────────────┘

CurlException::CurlException(const std::string& message, CURLcode curl_code, const std::string& url)
    : std::runtime_error(message), curl_code_(curl_code), url_(url) {}

CURLcode CurlException::get_error_code() const {
    return curl_code_;
}

const std::string& CurlException::get_url() const {
    return url_;
}

// ┌────────────────┐
// │ HttpCurlClient │
// └────────────────┘

bool HttpCurlClient::curl_initialized_ = false;

size_t HttpCurlClient::write_callback(void* buffer, size_t size, size_t nmemb, void* userp) {
    HttpCurlClient* client = static_cast<HttpCurlClient*>(userp);
    if (!client) {
        return 0;
    }

    size_t real_size = size * nmemb;
    const uint8_t* data = static_cast<const uint8_t*>(buffer);
    client->response_data_.insert(client->response_data_.end(), data, data + real_size);

    return real_size;
}

HttpCurlClient::HttpCurlClient(bool ssl_verify) {
    if (!curl_initialized_) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl_initialized_ = true;
    }

    curl_ = curl_easy_init();
    if (!curl_) {
        throw std::runtime_error("Failed to initialize CURL");
    }
    header_list_ = nullptr;
    http_status_code_ = 0;

    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYPEER, ssl_verify ? 1L : 0L);
    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYHOST, ssl_verify ? 2L : 0L);
}

HttpCurlClient::~HttpCurlClient() {
    if (curl_) {
        curl_easy_cleanup(curl_);
    }
    if (header_list_) {
        curl_slist_free_all(header_list_);
    }
}

HttpCurlClient& HttpCurlClient::reset() {
    if (curl_) {
        curl_easy_reset(curl_);
    }
    if (header_list_) {
        curl_slist_free_all(header_list_);
        header_list_ = nullptr;
    }
    response_data_.clear();
    http_status_code_ = 0;
    current_url_.clear();
    return *this;
}

HttpCurlClient& HttpCurlClient::set_url(const std::string& url) {
    current_url_ = url;
    curl_easy_setopt(curl_, CURLOPT_URL, current_url_.c_str());
    return *this;
}

HttpCurlClient& HttpCurlClient::set_method(const std::string& method) {
    curl_easy_setopt(curl_, CURLOPT_CUSTOMREQUEST, method.c_str());
    return *this;
}

HttpCurlClient& HttpCurlClient::set_headers(const std::vector<std::pair<std::string, std::string>>& headers) {
    for (const auto &header : headers) {
        header_list_ = curl_slist_append(header_list_, (header.first + ": " + header.second).c_str());
    }
    curl_easy_setopt(curl_, CURLOPT_HTTPHEADER, header_list_);
    return *this;
}

HttpCurlClient& HttpCurlClient::set_body(const std::string& body) {
    curl_easy_setopt(curl_, CURLOPT_POSTFIELDS, body.c_str());
    return *this;
}

HttpCurlClient& HttpCurlClient::set_timeout(int timeout_seconds) {
    curl_easy_setopt(curl_, CURLOPT_TIMEOUT, timeout_seconds);
    return *this;
}

HttpCurlClient& HttpCurlClient::set_connect_timeout(int timeout_seconds) {
    curl_easy_setopt(curl_, CURLOPT_CONNECTTIMEOUT, timeout_seconds);
    return *this;
}

HttpResponse HttpCurlClient::execute() {
    response_data_.clear();
    http_status_code_ = 0;

    curl_easy_setopt(curl_, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl_, CURLOPT_WRITEDATA, this);

    CURLcode result = curl_easy_perform(curl_);
    if (result != CURLE_OK) {
        throw CurlException(curl_easy_strerror(result), result, current_url_);
    }

    curl_easy_getinfo(curl_, CURLINFO_RESPONSE_CODE, &http_status_code_);
    return HttpResponse(http_status_code_, response_data_);
}
