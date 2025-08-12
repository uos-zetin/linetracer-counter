#include <mutex>
#include <queue>
#include <condition_variable>
#include <vector>

template<typename T>
class ThreadSafeQueue {
private:
    mutable std::mutex mtx_;
    std::queue<T> queue_;
    std::condition_variable condition_;

public:
    ThreadSafeQueue() = default;
    ThreadSafeQueue(const ThreadSafeQueue&) = delete;
    ThreadSafeQueue& operator=(const ThreadSafeQueue&) = delete;

    void push(const T& item) {
        std::lock_guard<std::mutex> lock(mtx_);
        queue_.push(item);
        condition_.notify_one();
    }

    bool try_pop(T& item) {
        std::lock_guard<std::mutex> lock(mtx_);
        if(queue_.empty()) {
            return false;
        }
        item = queue_.front();
        queue_.pop();
        return true;
    }

    std::vector<T> pop_all() {
        std::lock_guard<std::mutex> lock(mtx_);
        std::vector<T> result;
        while (!queue_.empty()) {
            result.push_back(queue_.front());
            queue_.pop();
        }
        return result;
    }

    size_t size() const {
        std::lock_guard<std::mutex> lock(mtx_);
        return queue_.size();
    }

    bool empty() const {
        std::lock_guard<std::mutex> lock(mtx_);
        return queue_.empty();
    }
};
