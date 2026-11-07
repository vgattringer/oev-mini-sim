import { Bus, TrainFront, TrainFrontTunnel, TramFront } from 'lucide-react'

const ICONS_BY_VEHICLE_TYPE = {
    ptTram: TramFront,
    ptMetro: TrainFrontTunnel,
    ptBusCity: Bus,
    ptBusNight: Bus,
}

function VehicleTypeIcon({ type, size = 20 }) {
    const Icon = ICONS_BY_VEHICLE_TYPE[type] ?? TrainFront

    return <Icon size={size} aria-hidden="true" />
}

export default VehicleTypeIcon