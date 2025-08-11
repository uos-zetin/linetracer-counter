cmake_minimum_required(VERSION 3.16)
project(rpi-counter-sensor VERSION 1.0.0 LANGUAGES CXX)

# Set default build type if not specified
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(PkgConfig REQUIRED)
find_package(Threads REQUIRED)

# Check package installation
pkg_check_modules(CURL REQUIRED libcurl)
pkg_check_modules(NLOHMANN_JSON REQUIRED nlohmann_json)

# Source files
set(SOURCES
    src/main.cpp
    src/config.cpp
    src/logger.cpp
    src/http_curl_client.cpp
    src/http_sensor_data_sender.cpp
    src/bpw34_sensor_data_reader.cpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Include directories and link libraries
target_include_directories(${PROJECT_NAME} PRIVATE 
    src
    ${CURL_INCLUDE_DIRS} 
    ${NLOHMANN_JSON_INCLUDE_DIRS}
)

target_link_libraries(${PROJECT_NAME} 
    PRIVATE 
    Threads::Threads
    ${CURL_LIBRARIES}
    ${NLOHMANN_JSON_LIBRARIES}
)

# Set output directory
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# Installation targets
# Install binary to /usr/local/bin
install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION bin
    CONFIGURATIONS Release Debug
)

# Install systemd service file
install(FILES ${PROJECT_NAME}.service
    DESTINATION lib/systemd/system
)

# Install config file (only if it doesn't exist)
configure_file(config.example.json ${CMAKE_BINARY_DIR}/config.example.json COPYONLY)
install(CODE "
    # Create config directory
    file(MAKE_DIRECTORY $ENV{DESTDIR}/etc/${PROJECT_NAME})

    # Copy config file only if it doesn't exist
    if(NOT EXISTS $ENV{DESTDIR}/etc/${PROJECT_NAME}/config.json)
        file(COPY \${CMAKE_SOURCE_DIR}/config.example.json 
             DESTINATION $ENV{DESTDIR}/etc/${PROJECT_NAME}
             FILE_PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ)
        file(RENAME $ENV{DESTDIR}/etc/${PROJECT_NAME}/config.example.json 
                   $ENV{DESTDIR}/etc/${PROJECT_NAME}/config.json)
        message(STATUS \"Config file installed: /etc/${PROJECT_NAME}/config.json\")
    else()
        message(STATUS \"Config file already exists, skipping: /etc/${PROJECT_NAME}/config.json\")
    endif()

    # Create log directory
    file(MAKE_DIRECTORY $ENV{DESTDIR}/var/log/${PROJECT_NAME})

    message(STATUS \"Please restart the service to apply the new config: sudo systemctl restart ${PROJECT_NAME}\")
")

# Debug/Release configurations
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_definitions(${PROJECT_NAME} PRIVATE DEBUG)
    target_compile_options(${PROJECT_NAME} PRIVATE -g -O0)
else()
    target_compile_options(${PROJECT_NAME} PRIVATE -O2)
endif()
