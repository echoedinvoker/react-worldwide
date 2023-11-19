import styles from "./CountryList.module.css"
import Message from "./Message"
import Spinner from "./Spinner"
import CountryItem from "./CountryItem"
// import { useContext } from "react"
// import { CitiesContext } from "../contexts/CitiesContext"
import { useCities } from "../contexts/CitiesContext"

export default function CountryList() {
  // const { cities, isLoading } = useContext(CitiesContext)
  const { cities, isLoading } = useCities()

  if (isLoading) return <Spinner />
  if (cities.length === 0) return <Message message="Add your first city by clicking on a city on the map" />

  const countries = cities.reduce((acc, { country, emoji }) => {
    if (!acc.map(el => el.country).includes(country)) return [...acc, { country, emoji }];
    return acc
  }, [])


  return <ul className={styles.countryList}>
    {countries.map(country => <CountryItem key={country.country} country={country} />)}
  </ul>
}
