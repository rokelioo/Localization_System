#include <esp_now.h>
#include <WiFi.h>
#include <map>
#include <array>
#include <PubSubClient.h>
#include <RCSwitch.h>
#include <vector>
#define LED_BUILTIN 2
const int points_Count = 3;
const int beacons_Count = 3; // change
const int room_Count = 3; // change
const int value_Count = 5;
const int elders_Count = 2; // change
String uuid_Array[] = {"11111111-5555-6666-6666-777777777777", "Phenix 3"};
int current_Room = 0;
int current_Point = 0; 
int current_Value [beacons_Count] = {0};
int incoming_RSSI [beacons_Count] = {0};
int incoming_RSSI_KNN [beacons_Count] = {0};
const unsigned int MAX_MESSAGE_LENGTH = 12;
int location_RSSI [room_Count][beacons_Count][points_Count][value_Count];
int lastRoom = -1;
int roomCount = 0;
const int elders = 2;
int loc_current_room [elders] = {-1, -1};
int loc_last_published_room [elders] = {-1, -1};
int loc_last_room [elders] = {-1, -1};
int loc_count_room [elders] = {0, 0};
std::map<std::string, std::array<int, beacons_Count>> rssiValues;
double median_RSSI[room_Count][beacons_Count][points_Count];

enum {defaulttt, colection_RSSI, normalize_Data, collect_Compare_Estimate};
unsigned char state;

unsigned long A = 5592512;
unsigned long B = 5592368;
unsigned long C = 5592332;
unsigned long D = 5592323;

unsigned long lastButtonPressTime = 0;
const unsigned long buttonPressInterval = 5000; 

int currentRoom = -1;

const char* ssid = "TP-LINK_B2E860";
const char* password = "19730928";

const char* mqtt_server = "3.122.59.75";
const char* mqtt_username = "elder";
const char* mqtt_password = "elder123";

WiFiClient espClient;
PubSubClient client(espClient);

TaskHandle_t Task1;


// Structure example to receive data
// Must match the sender structure
typedef struct struct_message {
   int id; // must be unique for each sender board
    char uuid[37];
    int rssi;
}struct_message;

// Create a struct_message called myData
struct_message myData;

// Create a structure to hold the readings from each board
struct_message board1;
struct_message board2;
struct_message board3;

// Create an array with all the structures
struct_message boardsStruct[3] = {board1, board2, board3};

// callback function that will be executed when data is received
void OnDataRecv(const uint8_t * mac_addr, const uint8_t *incomingData, int len) {
  char macStr[18];
  //Serial.print("Packet received from: ");
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
 // Serial.println(macStr);
  memcpy(&myData, incomingData, sizeof(myData));
  //Serial.printf("Board ID %u: %u bytes\n", myData.id, len);
  // Update the structures with the new incoming data
  //boardsStruct[myData.id-1].uuid = c_str(myData.uuid);
 // Serial.printf("uuid value: %s \n", myData.uuid);
 //boardsStruct[myData.id-1].rssi = myData.rssi;

  std::string uuid(myData.uuid);
  rssiValues[uuid][myData.id - 1] = myData.rssi;

  incoming_RSSI[myData.id-1] = myData.rssi;
  incoming_RSSI_KNN[myData.id-1] = myData.rssi;
  //Serial.printf("rssi value: %d \n", myData.rssi);
  if(state == colection_RSSI)
  {
    Serial.println("Dejimo procesas");
    Create_Radio_Map(myData.id, myData.rssi, myData.uuid);
  }
  
}


void codeForTask1( void * parameter ) {

  RCSwitch mySwitch = RCSwitch();
  int Ccount = 0;
  int Dcount = 0;
  int Bcount = 0;
  int Acount = 0;
  mySwitch.enableReceive(16);  // Receiver on interrupt 0 => that is pin #2
  for (;;) {

  if (mySwitch.available()) {
    if(mySwitch.getReceivedValue() == A)
    {
      if(millis() - lastButtonPressTime >= buttonPressInterval)
      {
        lastButtonPressTime = millis();
        String emergency_Text = uuid_Array[0] + "+" + current_Room;
        char emergency_Char_Array[emergency_Text.length() + 1];
        emergency_Text.toCharArray(emergency_Char_Array, sizeof(emergency_Char_Array));
        client.publish("elder/emergency/topic", emergency_Char_Array);
      }
      Acount++;
    }
    else if(mySwitch.getReceivedValue() == B)
    {
      Bcount++;
      if(Bcount == 15)
      {
        state = collect_Compare_Estimate;
      }
    }
    else if(mySwitch.getReceivedValue() == C)
    {
      Ccount++;
      if(Ccount == 30)
      {
        state = colection_RSSI;
      }
      
    }
    else if(mySwitch.getReceivedValue() == D)
    {
      Dcount++;
      if(Dcount == 15)
      {
      current_Point++;
      memset(current_Value, 0, sizeof(current_Value));
      if(current_Point == points_Count)
      {
        current_Point = 0;
        current_Room++;
        if(current_Room == room_Count)
        {
          state = normalize_Data;
        }

      }
      Dcount=0;
      }
      
    }

    mySwitch.resetAvailable();
  }
  int i = 1;
  i++;
  

  }
}
int KNN(int k, int arr []) {

    std::vector<std::pair<double, int>> distances;


    for (int room = 0; room < room_Count; ++room) {
        for (int point = 0; point < points_Count; ++point) {
            double sum = 0;
            for (int beacon = 0; beacon < beacons_Count; ++beacon) {
                    sum += pow(median_RSSI[room][beacon][point] - arr[beacon], 2);
                // sum = pow(median_RSSI[room][beacon][point] - arr[beacon], 2);
                // double distance = sqrt(sum);
                 //distances.push_back(std::make_pair(distance, room));
            }
            double distance = sqrt(sum);
            distances.push_back(std::make_pair(distance, room));
        }
    }


    std::sort(distances.begin(), distances.end());
    Serial.println("-----------------------------");
   for (const auto& distance : distances) {
        Serial.print("Distance: ");
        Serial.print(distance.first);
        Serial.print(", Room: ");
        Serial.println(distance.second);
    }
    Serial.println("-----------------------------");

    std::vector<int> votes(room_Count, 0);
    for (int i = 0; i < k; ++i) {
        votes[distances[i].second]++;
    }


    int predicted_room = std::max_element(votes.begin(), votes.end()) - votes.begin();
    
    return predicted_room;
}





void setup() {
  // put your setup code here, to run once:
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  xTaskCreatePinnedToCore(    codeForTask1,    "RFListener",    5000,    NULL,    tskIDLE_PRIORITY,    &Task1,    0);
  //Set device as a Wi-Fi Station
  WiFi.mode(WIFI_AP_STA);
  // WiFi.setSleep(false); // Disable power saving mode
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.channel());
  client.setServer(mqtt_server, 1883);
  client.setKeepAlive(60);
  
  //Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  
  // Once ESPNow is successfully Init, we will register for recv CB to
  // get recv packer info
  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  int loc_index = 0;
  
  switch (state)
  {
    case colection_RSSI:
  
    break;
    
    case normalize_Data:
    //Serial.println("Normalizuoju");
    Print_Array();
    calculate_Median();
    
    break;

    case collect_Compare_Estimate:
    loc_index = 0;
    for (auto &pair : rssiValues) {
      bool calc = true;
      std::string key = pair.first;
      std::array<int, beacons_Count>& arr = pair.second;
     
      for (size_t i = 0; i < arr.size(); ++i) {
        int val = arr[i];
        if(val == 0){
          calc = false;
        }
      }
      if(calc)
      {
        int times = 0;
        for (size_t i = 0; i < arr.size(); ++i) {
          int val = arr[i];
          if(val == -999){
            times++;
          }
          if(times == arr.size())
          {
            calc = false;
          }
        }
        if(calc)
        {
          loc_current_room[loc_index] = KNN(3, arr.data()); 
          if (loc_current_room[loc_index] == loc_last_room[loc_index]) {
            loc_count_room[loc_index]++;
          } else {
              loc_count_room[loc_index] = 0;  // reset the count
          }
          
          if(loc_current_room[loc_index] != loc_last_published_room[loc_index] && loc_count_room[loc_index] == 3) {  
          Serial.print(uuid_Array[loc_index]);
          Serial.print("Beacon is currently located in room ");
          Serial.println(loc_current_room[loc_index]);
          String location_Text = uuid_Array[loc_index] + "+" + loc_current_room[loc_index];
          char location_Char_Array[location_Text.length() + 1];
          location_Text.toCharArray(location_Char_Array, sizeof(location_Char_Array));
          client.publish("elder/location/topic", location_Char_Array);

          loc_last_published_room[loc_index] = loc_current_room[loc_index];
          }
          loc_last_room[loc_index] = loc_current_room[loc_index];
          std::fill(arr.begin(), arr.end(), 0); 
        }
        
      }
      loc_index++;
    }
    break;

    default:
      Serial.println("\n We hit the default");
      delay(3000);

    break;
  }
  
    if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
}
void Create_Radio_Map(int id, int rssi, String uuid)
{
  if(uuid.equals("11111111-5555-6666-6666-777777777777"))
  {
    if(current_Value[id-1] < value_Count)
    {
      digitalWrite(LED_BUILTIN, HIGH);
      location_RSSI[current_Room][id-1][current_Point][current_Value[id-1]] = rssi;
      current_Value[id-1]++;
      Serial.printf("Pririnkta %d", current_Value[id-1]);
    }
    else{
      digitalWrite(LED_BUILTIN, LOW);
    }
  }
}
void Print_Array()
{
  static int kartai = 0;
  if(kartai == 0)
  {
         for (int i = 0; i < room_Count; i++)
    {
        for (int j = 0; j < beacons_Count; j++)
        {
            for (int k = 0; k < points_Count; k++)
            {
                for (int l = 0; l < value_Count; l++)
                {
                    Serial.print("location_RSSI[");
                    Serial.print(i);
                    Serial.print("][");
                    Serial.print(j);
                    Serial.print("][");
                    Serial.print(k);
                    Serial.print("][");
                    Serial.print(l);
                    Serial.print("] = ");
                    Serial.println(location_RSSI[i][j][k][l]);
                }
            }
        }
    }
      kartai++;
  }

}
void calculate_Median(){
  static int kartai = 0;
  if(kartai == 0)
  {
  for (int room = 0; room < room_Count; ++room) {
        for (int beacon = 0; beacon < beacons_Count; ++beacon) {
            for (int point = 0; point < points_Count; ++point) {
                std::vector<int> values(value_Count);
                for (int value = 0; value < value_Count; ++value) {
                    values[value] = location_RSSI[room][beacon][point][value];
                }
                std::sort(values.begin(), values.end());
                double median;
                if (value_Count % 2 == 0) {
                    median = (values[value_Count / 2 - 1] + values[value_Count / 2]) / 2.0;
                } else {
                    median = values[value_Count / 2];
                }
                median_RSSI[room][beacon][point] = median;
            }
        }
    }

    for (int room = 0; room < room_Count; ++room) {
        for (int beacon = 0; beacon < beacons_Count; ++beacon) {
            for (int point = 0; point < points_Count; ++point) {
                Serial.print("Median RSSI for room ");
                Serial.print(room);
                Serial.print(", beacon ");
                Serial.print(beacon);
                Serial.print(", point ");
                Serial.print(point);
                Serial.print(": ");
                Serial.println(median_RSSI[room][beacon][point], 6);
            }
        }
    }
    kartai++;
  }
    
}


void reconnect() {
  // Loop until we're reconnected

  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("LocalizationOne", mqtt_username, mqtt_password, "LWTtopic", MQTTQOS1, true, "Server is down")) {
      Serial.println("connected");
      // Once connected, subscribe to MQTT topic
      client.subscribe("my/test/topic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
