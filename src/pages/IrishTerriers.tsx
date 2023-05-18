import { Page } from "../components/common/Page";
import { IntroTextCard } from "../components/common/IntroTextCard";
import { CoverPhotosCard } from "../components/common/CoverPhotosCard";
import { SiteInformation } from "../components/common/siteInformation/SiteInformation";
import { DogKennel } from "../components/dogKennel/DogKennel";

export const IrishTerriers = () => {
  const pageName = "irishTerriers";

  return (
    <Page title="Ierse terriërs">
      <IntroTextCard page={pageName} />
      <CoverPhotosCard page={pageName} />
      <DogKennel title="Onze kennel" directory="terriers" />
      <SiteInformation page={pageName} />
    </Page>
  );
};
