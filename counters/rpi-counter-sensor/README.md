# RPI Counter Sensor Data Reader/Sender

## Requirements

```sh
sudo apt install cmake build-essential nlohmann-json3-dev libcurl4-openssl-dev
```

## How to build & install

```sh
mkdir build
cmake ..
make
sudo make install
```

## How to run

```sh
sudo systemctl restart rpi-counter-sensor.service
```

## How to stop

```sh
sudo systemctl stop rpi-counter-sensor.service
```

## How to check logs

```sh
sudo journalctl -u rpi-counter-sensor.service -f
```
