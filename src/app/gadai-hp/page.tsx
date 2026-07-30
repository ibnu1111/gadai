import ServiceLandingPage from '@/components/service/ServiceLandingPage'
import { getService, serviceMetadata } from '@/lib/services'

const service = getService('gadai-hp')

export const metadata = serviceMetadata(service)

export default function GadaiHpPage() {
  return <ServiceLandingPage service={service} />
}
