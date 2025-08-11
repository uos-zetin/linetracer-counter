#pragma once

#include <queue>
#include <mutex>
#include <condition_variable>
#include <limits>
#include <chrono>

template <typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue_;
    std::mutex mutex_;
    std::condition_variable cv_;
    size_t max_size_;

public:
    ThreadSafeQueue() : max_size_(std::numeric_limits<size_t>::max()) {}
    explicit ThreadSafeQueue(size_t max_size) : max_size_(max_size) {}

    ThreadSafeQueue(const ThreadSafeQueue& other) {
        std::lock_guard<std::mutex> lock(const_cast<std::mutex&>(other.mutex_));
        queue_ = other.queue_;
        max_size_ = other.max_size_;
    }

    ThreadSafeQueue& operator=(const ThreadSafeQueue& other) {
        if (this != &other) {
            std::lock(mutex_, const_cast<std::mutex&>(other.mutex_));
            std::lock_guard<std::mutex> lock_this(mutex_, std::adopt_lock);
            std::lock_guard<std::mutex> lock_other(const_cast<std::mutex&>(other.mutex_), std::adopt_lock);
            queue_ = other.queue_;
            max_size_ = other.max_size_;
        }
        return *this;
    }

    void push(const T& data) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.size() >= max_size_) {
            queue_.pop();
        }
        queue_.push(data);
        cv_.notify_one();
    }

    void push(T&& data) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.size() >= max_size_) {
            queue_.pop();
        }
        queue_.push(std::move(data));
        cv_.notify_one();
    }

    bool try_pop(T& data) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.empty()) {
            return false;
        }
        data = std::move(queue_.front());
        queue_.pop();
        return true;
    }

    T pop() {
        std::unique_lock<std::mutex> lock(mutex_);
        cv_.wait(lock, [this] { return !queue_.empty(); });
        T data = std::move(queue_.front());
        queue_.pop();
        return data;
    }

    template<typename Rep, typename Period>
    bool pop(T& data, const std::chrono::duration<Rep, Period>& timeout) {
        std::unique_lock<std::mutex> lock(mutex_);
        if (cv_.wait_for(lock, timeout, [this] { return !queue_.empty(); })) {
            data = std::move(queue_.front());
            queue_.pop();
            return true;
        }
        return false;
    }

    bool empty() const {
        std::lock_guard<std::mutex> lock(const_cast<std::mutex&>(mutex_));
        return queue_.empty();
    }

    bool full() const {
        std::lock_guard<std::mutex> lock(const_cast<std::mutex&>(mutex_));
        return queue_.size() >= max_size_;
    }

    size_t size() const {
        std::lock_guard<std::mutex> lock(const_cast<std::mutex&>(mutex_));
        return queue_.size();
    }

    size_t max_size() const {
        return max_size_;
    }
};