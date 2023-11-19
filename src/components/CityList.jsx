import styles from "./CityList.module.css"
import Message from "./Message"
import Spinner from "./Spinner"
import CityItem from "./CityItem"
// import { useContext } from "react"
// import { CitiesContext } from "../contexts/CitiesContext"
import { useCities } from "../contexts/CitiesContext"

export default function CityList() {
  // const { cities, isLoading } = useContext(CitiesContext)
  const { cities, isLoading } = useCities()

  if (isLoading) return <Spinner />
  if (cities.length === 0) return <Message message="Add your first city by clicking on a city on the map" />

  return <ul className={styles.cityList}>
    {cities.map(city => <CityItem key={city.id} city={city} />)}
  </ul>
}
