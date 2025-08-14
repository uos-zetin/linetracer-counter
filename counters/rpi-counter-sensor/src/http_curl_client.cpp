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

// ┌───────────────┐
// │ CurlException │
// └───────────────┘

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
    std::vector<uint8_t>* response_data = static_cast<std::vector<uint8_t>*>(userp);
    if (!response_data) {
        return 0;
    }

    size_t real_size = size * nmemb;
    const uint8_t* data = static_cast<const uint8_t*>(buffer);
    response_data->insert(response_data->end(), data, data + real_size);

    return real_size;
}

HttpCurlClient::HttpCurlClient(const HttpCurlClientConfig& config) : config_(config) {
    if (!curl_initialized_) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl_initialized_ = true;
    }

    curl_ = curl_easy_init();
    if (!curl_) {
        throw std::runtime_error("Failed to initialize CURL");
    }

    // SSL 설정
    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYPEER, config.ssl_verify ? 1L : 0L);
    curl_easy_setopt(curl_, CURLOPT_SSL_VERIFYHOST, config.ssl_verify ? 2L : 0L);

    // Keep-Alive 설정
    if (config.keep_alive) {
        curl_easy_setopt(curl_, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_easy_setopt(curl_, CURLOPT_TCP_KEEPALIVE, 1L);
        curl_easy_setopt(curl_, CURLOPT_TCP_KEEPIDLE, 120L);
        curl_easy_setopt(curl_, CURLOPT_TCP_KEEPINTVL, 60L);
    }
}

HttpCurlClient::~HttpCurlClient() {
    if (curl_) {
        curl_easy_cleanup(curl_);
    }
}

HttpCurlClient::HttpCurlClient(HttpCurlClient&& other)
    : config_(std::move(other.config_)), curl_(other.curl_) {
    other.curl_ = nullptr;
}

HttpCurlClient& HttpCurlClient::operator=(HttpCurlClient&& other) {
    if (this != &other) {
        if (curl_) {
            curl_easy_cleanup(curl_); // 기존 curl 핸들 정리
        }
        config_ = std::move(other.config_);
        curl_ = other.curl_;
        other.curl_ = nullptr;
    }
    return *this;
}

HttpResponse HttpCurlClient::request(const HttpCurlRequest& request) {
    // URL 설정
    curl_easy_setopt(curl_, CURLOPT_URL, request.url.c_str());

    // HTTP 메서드 설정
    curl_easy_setopt(curl_, CURLOPT_CUSTOMREQUEST, request.method.c_str());

    // 헤더 설정
    CurlHeaderList headers;
    for (const auto& [key, value] : request.headers) {
        headers.append(key + ": " + value);
    }
    if (config_.keep_alive) { // keep-alive 헤더 추가
        headers.append("Connection: keep-alive");
    }
    if (headers.get()) {
        curl_easy_setopt(curl_, CURLOPT_HTTPHEADER, headers.get());
    }

    // Body 설정
    if (!request.body.empty()) {
        curl_easy_setopt(curl_, CURLOPT_POSTFIELDS, request.body.data());
        curl_easy_setopt(curl_, CURLOPT_POSTFIELDSIZE, request.body.size());
    }

    // 타임아웃 설정
    if (request.timeout_seconds > 0) {
        curl_easy_setopt(curl_, CURLOPT_TIMEOUT, request.timeout_seconds);
    }

    // 응답 데이터 저장을 위한 버퍼
    std::vector<uint8_t> response_data;

    // 콜백 설정
    curl_easy_setopt(curl_, CURLOPT_WRITEFUNCTION, write_callback);
    curl_easy_setopt(curl_, CURLOPT_WRITEDATA, &response_data);

    // 요청 실행
    CURLcode result = curl_easy_perform(curl_);

    // 에러 확인
    if (result != CURLE_OK) {
        throw CurlException(curl_easy_strerror(result), result, request.url);
    }

    // HTTP 상태 코드 가져오기
    long http_status_code = 0;
    curl_easy_getinfo(curl_, CURLINFO_RESPONSE_CODE, &http_status_code);

    return HttpResponse(static_cast<int>(http_status_code), response_data);
}
