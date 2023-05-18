import { CoverPhotosCard } from "../components/common/CoverPhotosCard";
import { IntroTextCard } from "../components/common/IntroTextCard";
import { Page } from "../components/common/Page";
import { SiteInformation } from "../components/common/siteInformation/SiteInformation";
import { DogKennel } from "../components/dogKennel/DogKennel";

export const SolognoteSheep = () => {
  const pageName = "solognoteSheep";

  return (
    <Page title="Solognote schapen">
      <IntroTextCard page={pageName} />
      <CoverPhotosCard page={pageName} />
      <DogKennel title="Onze hulpjes" directory="bordercollies" />
      <SiteInformation page={pageName} />
    </Page>
  );
};
