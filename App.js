import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
//  StyleSheet.create({ }) : object다. 자동완성기능 가능. 안써도 됨.
// react native를 빠르게 만들기 위해 많은 components(화면에 렌더링할 항목),api(js코드-운영체제와 소통)들을 줄임.
// 그래서 다른곳에서 component,api들을 받아와야 한다=> expo팀은 자체packages,api들 만들음 : expo sdk
// expo가 react native component들을 일부 복제해서 조금바꿨기때문에 StatusBar가 expo와 react native 둘다에 있다

//1. Flex Direction - 웹:row기본(수평) / react-native앱:column기본(수직)
//2. flex:1 부모에 넣으면 자식에서 flex:1으로 비율을 적용할수 있음

// expo install expo-location

const { width: SCREEN_WIDTH } = Dimensions.get("window"); //스크린의 가로길이를 가져와줌

const API_KEY = "d892b91002eabd160955c7e8ede6566d"; //원래는 서버에 넣어둬야 함 지금은 실습하려고 여기넣음

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    // 1. 유저에게 위치허가 요청
    const { granted } = await Location.requestForegroundPermissionsAsync(); //Foreground:앱사용중에만 위치사용
    if (!granted) {
      setOk(false); //위치허가안했을때
    }
    // 2. 유저 현재 위치받기
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 }); //정확도 :5
    // 3. 받은 위치를 city명으로 변환
    //reverseGeocodeAsync: 위도,경도를 주소로 변환 / Geocode : 주소를 위도,경도로 변환
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    // 4. 위치 얻으면 날씨API호출 받기/ &units=metric :기온단위변경
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.daily);
  };
  useEffect(() => {
    getWeather(); //컴포넌트가 마운트될때 함수실행됨.
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled // 넘길때 끈끈하게 넘어가게하기
        horizontal //가로방향으로 넘기기
        // indicatorStyle="white" //ios만 작동. 페이지표시바 색 변경
        showsHorizontalScrollIndicator={false} //밑에 페이지표시바 안보이기
        contentContainerStyle={styles.weather} //ScrollView는 style이 안되서 => contentContainerStyle로 적용
      >
        {days.length === 0 ? ( //기상정보 없으면
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          //기상정보 있으면
          days.map((day, index) => (
            //parseFloat(day.temp.day).toFixed(1) :소수점한자리까지만 보기
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <View style={styles.info}>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={68}
                    color="white"
                  />
                  <Text style={styles.description}>{day.weather[0].main}</Text>
                  {/* <Text style={styles.tinyText}>{day.weather[0].description}</Text> */}
                  <Text style={styles.tinyText}>
                    {new Date(day.dt * 1000).toString().slice(0, 3)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#74b9ff",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 58,
    fontWeight: "500",
    color: "white",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  temp: {
    fontWeight: "600",
    fontSize: 100,
    color: "white",
  },
  info: {
    margin: 10,
  },
  description: {
    fontSize: 30,
    color: "white",
    fontWeight: "500",
  },
  tinyText: {
    fontSize: 20,
    color: "white",
    fontWeight: "500",
  },
});
