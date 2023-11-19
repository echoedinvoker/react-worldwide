// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
// import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import Spinner from "./Spinner"
import Message from "./Message"
import { useUrlPosition } from "../hooks/useUrlPosition";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";


const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client"

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [lat, lng] = useUrlPosition()
  const [isLoading, setIsLoading] = useState(false)
  const [emoji, setEmoji] = useState("")
  const [error, setError] = useState(null)

  useEffect(function() {
    if (!lat && !lng) return

    async function fetchCityData() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`)
        const data = await res.json()
        const { city, locality, countryName: country, countryCode } = data
        setCityName(city || locality || "")
        setCountry(country)
        setEmoji(convertToEmoji(countryCode))

        if (!countryCode) throw new Error("That doesn't seem to be a city. Click somehwere else 😏")
      } catch (error) {
        setError(error.message || "Something wrong 🙁")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCityData()
  }, [lat, lng])

  const navigate = useNavigate()

  const { createCity, isLoading: isAdding } = useCities()

  async function handleSubmit(e) {
    e.preventDefault()

    const newCity = {
      cityName,
      country,
      emoji,
      position: { lat, lng },
      date,
      notes
    }

    await createCity(newCity)
    navigate('/app/cities')
  }

  if (isLoading) return <Spinner />

  if (!lat && !lng) return <Message message="Start by clicking on the map" />

  if (error) return <Message message={error} />

  return (
    <form className={`${styles.form} ${isAdding ? styles.loading : ""}`} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <ReactDatePicker id="date" selected={date} onChange={date => setDate(date)} />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary'>Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
