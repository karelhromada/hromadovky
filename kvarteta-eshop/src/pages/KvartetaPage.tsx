import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowToPlay from '../components/HowToPlay';
import ProductShowcase from '../components/ProductShowcase';
import Testimonials from '../components/Testimonials';
import CardCreator from '../components/CardCreator';
import FAQ from '../components/FAQ';
import type { CartItem } from '../App';

interface KvartetaPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const KvartetaPage: React.FC<KvartetaPageProps> = ({ onAddToCart }) => {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <HowToPlay />
            <ProductShowcase onAddToCart={onAddToCart} />
            <Testimonials />
            <CardCreator onAddToCart={onAddToCart} />
            <FAQ />
        </>
    );
};

export default KvartetaPage;
