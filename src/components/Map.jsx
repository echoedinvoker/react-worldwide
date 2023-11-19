import styles from "./Map.module.css"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from "react"
import { useCities } from "../contexts/CitiesContext"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useGeolocation } from "../hooks/useGeolocation"
import Button from "./Button"
import { useUrlPosition } from "../hooks/useUrlPosition"

export default function Map() {
  const [mapPosition, setMapPosition] = useState([40, 0])
  const { cities } = useCities()
  // const [searchParams] = useSearchParams()
  const { isLoading, position, getPosition } = useGeolocation()

  // const mapLat = searchParams.get('lat')
  // const mapLng = searchParams.get('lng')
  const [mapLat, mapLng] = useUrlPosition()

  useEffect(function() {
    if (mapLat && mapLng) setMapPosition([mapLat, mapLng])
  }, [mapLat, mapLng])

  useEffect(function() {
    if (position)
      setMapPosition([position.lat, position.lng])

  }, [position])


  return <div
    className={styles.mapContainer}
  >
    <Button type="position" onClick={getPosition}>
      {isLoading ? "Loading..." : "USE YOUR POSITION"}
    </Button>
    <MapContainer
      className={styles.map}
      center={mapPosition}
      zoom={13}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cities.map(({ id, position: { lat, lng }, emoji, country }) =>
        <Marker key={id} position={[lat, lng]}>
          <Popup>
            <span>{emoji}</span>{country}
          </Popup>
        </Marker>
      )}
      <ChangeCenter position={mapPosition} />
      <DetectClick />
    </MapContainer>
  </div>
}

function ChangeCenter({ position }) {
  const map = useMap()
  map.setView(position)
  return null
}
function DetectClick() {
  const navigate = useNavigate()
  useMapEvents({
    // click: (e) => console.log(e)
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
  })
}
