import CertificateClient from "../../../components/CertificateClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CertificateClient id={id} />;
}
