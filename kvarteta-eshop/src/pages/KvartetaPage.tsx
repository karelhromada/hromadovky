import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
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
            <ProductShowcase onAddToCart={onAddToCart} />
            <CardCreator onAddToCart={onAddToCart} />
            <Testimonials />
            <FAQ />
        </>
    );
};

export default KvartetaPage;
