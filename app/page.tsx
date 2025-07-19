'use client';
import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Categories from './components/Categories';
import BestSeller from './components/BestSeller';
import Hotdeals from './components/Hotdeals';
import Slogan from './components/slogan';
import New from './components/New';
import Reviews from './components/reviews';
import Partners from './components/Partners';
import NewsletterDialog from './shared_components/NewsletterDialog';
import AOS from 'aos';
import 'aos/dist/aos.css';


export default function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNewsletter(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AOS.init({});
  }, []);

  return (
    <>
      <Hero />
      <Categories />
      <BestSeller />
      <Hotdeals />
      <Slogan />
      <New />
      <Partners />
      <Reviews />
      <NewsletterDialog isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
    </>
  );
}