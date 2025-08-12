#include <chrono>
#include <thread>

template<typename Rep, typename Period>
class PrecisionTimer {
private:
    std::chrono::steady_clock::time_point start_time_;
    std::chrono::duration<Rep, Period> interval_;
    int cycle_count_;

public:
    PrecisionTimer(std::chrono::duration<Rep, Period> interval) 
        : start_time_(std::chrono::steady_clock::now())
        , interval_(interval)
        , cycle_count_(0) {}

    void wait_for_next_cycle() {
        cycle_count_++;
        auto target_time = start_time_ + (interval_ * cycle_count_);
        auto current_time = std::chrono::steady_clock::now();

        if (target_time > current_time) {
            std::this_thread::sleep_until(target_time);
        }
    }

    double get_average_jitter() const {
        auto expected_time = start_time_ + (interval_ * cycle_count_);
        auto current_time = std::chrono::steady_clock::now();
        auto diff = std::chrono::duration_cast<std::chrono::microseconds>(
            current_time - expected_time).count();
        return static_cast<double>(diff) / cycle_count_;
    }
};
  