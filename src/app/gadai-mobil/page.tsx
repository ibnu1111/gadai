import ServiceLandingPage from '@/components/service/ServiceLandingPage'
import { getService, serviceMetadata } from '@/lib/services'

const service = getService('gadai-mobil')

export const metadata = serviceMetadata(service)

export default function GadaiMobilPage() {
  return <ServiceLandingPage service={service} />
}
