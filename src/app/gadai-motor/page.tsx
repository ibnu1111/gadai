import ServiceLandingPage from '@/components/service/ServiceLandingPage'
import { getService, serviceMetadata } from '@/lib/services'

const service = getService('gadai-motor')

export const metadata = serviceMetadata(service)

export default function GadaiMotorPage() {
  return <ServiceLandingPage service={service} />
}
