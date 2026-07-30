import ServiceLandingPage from '@/components/service/ServiceLandingPage'
import { getService, serviceMetadata } from '@/lib/services'

const service = getService('gadai-laptop')

export const metadata = serviceMetadata(service)

export default function GadaiLaptopPage() {
  return <ServiceLandingPage service={service} />
}
