#include "interfaces.hpp"

class Bpw34SensorDataReader : public ISensorDataReader {
private:
    int spi_fd_;
    uint8_t spi_mode_;
    uint8_t spi_bits_;
    uint32_t spi_speed_;

    void initialize_spi(const std::string& spi_dev_path);
    uint16_t read_adc(uint8_t channel);
public:
    Bpw34SensorDataReader(const std::string& spi_dev_path);
    ~Bpw34SensorDataReader();

    SensorDataItem read_sensor_data() override;
};
