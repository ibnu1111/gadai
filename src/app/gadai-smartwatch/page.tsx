import ServiceLandingPage from '@/components/service/ServiceLandingPage'
import { getService, serviceMetadata } from '@/lib/services'

const service = getService('gadai-smartwatch')

export const metadata = serviceMetadata(service)

export default function GadaiSmartwatchPage() {
  return <ServiceLandingPage service={service} />
}
