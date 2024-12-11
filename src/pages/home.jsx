import HeroSection from '../sections/HeroSection';
import ConsultationSection from '../sections/ConsultationSection';
import CommunitySection from '../sections/CommunitySection';
import ArticleSection from '../sections/ArticleSection';

export default function Home() {
  return (
    <main className="relative">
      <div className="flex flex-col">
        <HeroSection />
        <ConsultationSection />
        <CommunitySection />
        <ArticleSection />
      </div>
    </main>
  );
}
