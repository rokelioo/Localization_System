#include <esp_now.h>
#include <esp_wifi.h>
#include <WiFi.h>
#include <map>
#include <Arduino.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <BLEEddystoneURL.h>
#include <BLEEddystoneTLM.h>
#include <BLEBeacon.h>
#include <queue> 
#define WINDOW_SIZE 4
std::map<String, std::queue<int>> rssiQueues;
std::map<String, unsigned long> lastSeen;
std::map<String, bool> deviceFound;

constexpr char WIFI_SSID[] = "TP-LINK_B2E860";
int scanTime = 1; //In seconds
BLEScan *pBLEScan;

double AverageRSSI = 0;

constexpr char* knownUUIDs[] = {"11111111-5555-6666-6666-777777777777", "6a4e3e10-667b-11e3-949a-0800200c9a66"};
constexpr int numUUIDs = sizeof(knownUUIDs) / sizeof(knownUUIDs[0]);

// REPLACE WITH THE RECEIVER'S MAC Address
uint8_t broadcastAddress[] = {0x58, 0xBF, 0x25, 0x18, 0x3A, 0x6C};


typedef struct struct_message {
    int id = 4; // must be unique for each sender board
    char uuid[37];
    int rssi;
} struct_message;

bool received = false;

// Create a struct_message called myData
struct_message myData;

// Create peer interface
esp_now_peer_info_t peerInfo;

// callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{
        void onResult(BLEAdvertisedDevice advertisedDevice)
        { 

              String deviceName = advertisedDevice.getName().c_str();
      if(deviceName.equals("fenix 3")) {
        String UUID = advertisedDevice.getServiceUUID().toString().c_str();
        processDevice(UUID, advertisedDevice);
      }
          
          if (advertisedDevice.haveManufacturerData() == true)
          {
            std::string strManufacturerData = advertisedDevice.getManufacturerData();

            uint8_t cManufacturerData[100];
            strManufacturerData.copy((char *)cManufacturerData, strManufacturerData.length(), 0);
        
            if (strManufacturerData.length() == 25 && cManufacturerData[0] == 0x4C && cManufacturerData[1] == 0x00)
            {
              BLEBeacon oBeacon = BLEBeacon();
              oBeacon.setData(strManufacturerData);
              String UUID = oBeacon.getProximityUUID().toString().c_str();
              processDevice(UUID, advertisedDevice);
            }
          }
        }
          void processDevice(const String& UUID, BLEAdvertisedDevice& advertisedDevice) {
            lastSeen[UUID] = millis();
            deviceFound[UUID] = true; // Set the flag for the found device
            for (int i = 0; i < numUUIDs; ++i) {
              if(UUID.equals(knownUUIDs[i])) { 
                Serial.print("Scanned device ");
                Serial.println(knownUUIDs[i]);
                myData.rssi = advertisedDevice.getRSSI();
                rssiQueues[UUID].push(advertisedDevice.getRSSI());
                if (rssiQueues[UUID].size() > WINDOW_SIZE) {
                  rssiQueues[UUID].pop();  
                }
          
                // Calculate average
                double sum = 0;
                std::queue<int> tempQueue = rssiQueues[UUID];
                while (!tempQueue.empty()) {
                  sum += tempQueue.front();
                  tempQueue.pop();
                }
                AverageRSSI = sum / rssiQueues[UUID].size();  
                //myData.rssi = AverageRSSI;
                Serial.println(myData.rssi);
                strcpy(myData.uuid, knownUUIDs[i]);
                SendIt();
                break;
              }
            }
          }
        
};

void setup() {
  Serial.begin(115200);
   // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);
int32_t channel = getWiFiChannel(WIFI_SSID);

WiFi.printDiag(Serial); 
esp_wifi_set_promiscuous(true);
esp_wifi_set_channel(channel, WIFI_SECOND_CHAN_NONE);
esp_wifi_set_promiscuous(false);
WiFi.printDiag(Serial); 

    BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); //create new scan
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99); // less or equal setInterval value

    for (int i = 0; i < numUUIDs; ++i) {
    lastSeen[knownUUIDs[i]] = 0;
    deviceFound[knownUUIDs[i]] = false; // Initialize the flag for each known device
  }    
 // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  // Add peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {

     for (int i = 0; i < numUUIDs; ++i) {
    deviceFound[knownUUIDs[i]] = false; // Reset the flag for each known device
    }
  
    BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
    pBLEScan->clearResults(); // delete results fromBLEScan buffer to release memory

          unsigned long currentTime = millis();
    for (int i = 0; i < numUUIDs; ++i) {
                Serial.print("Last times ");
                Serial.println(currentTime - lastSeen[knownUUIDs[i]]);
      if (currentTime - lastSeen[knownUUIDs[i]] > 4000) {
        // Send -999 signal for the device
        myData.rssi = -999;
        strcpy(myData.uuid, knownUUIDs[i]);
        Serial.print(myData.uuid);
        Serial.println("The device is missing");
        esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
        if (result == ESP_OK) {
          Serial.println("Sent with success");
        } else {
          Serial.println("Error sending the data");
        }

        // Update the last seen timestamp to prevent sending multiple -999 signals
        lastSeen[knownUUIDs[i]] = currentTime;
      }
    }

    /*
    for (int i = 0; i < numUUIDs; ++i) {
    if (!deviceFound[knownUUIDs[i]]) {
      // The device wasn't found in the scan
      myData.id = 1;
      myData.rssi = -999;
      strcpy(myData.uuid, knownUUIDs[i]);
      Serial.print(myData.uuid);
      Serial.println("The device is missing");
      esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
      if (result == ESP_OK) {
        Serial.println("Sent with success");
      } else {
        Serial.println("Error sending the data");
      }
    }
  }
  */
        
         

}
int32_t getWiFiChannel(const char *ssid) {
  if (int32_t n = WiFi.scanNetworks()) {
    for (uint8_t i=0; i<n; i++) {
      if (!strcmp(ssid, WiFi.SSID(i).c_str())) {
        return WiFi.channel(i);
      }
    }
  }
  return 0;
}
void SendIt()
{
            // Send message via ESP-NOW
            esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
             
            if (result == ESP_OK) {
              Serial.println("Sent existing with success");
            }
            else {
              Serial.println("Error sending the data");
            }

}
