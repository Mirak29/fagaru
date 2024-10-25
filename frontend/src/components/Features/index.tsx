import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Comment ça marche"
            paragraph="Les médecins s'inscrivent directement et peuvent ajouter des patients au système. Ils créent et gèrent les dossiers médicaux qui contiennent un identifiant unique, le nom du fichier et la date de création. Les médecins accèdent aux dossiers de leurs patients, tandis que les patients consultent uniquement leurs propres dossiers. Toutes les actions sont enregistrées de façon permanente sur la blockchain pour garantir la sécurité et la traçabilité."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
