import React from 'react';
import type { CartItem } from '../App';
import HeroSectionKarty from '../components/HeroSectionKarty';
import FeaturesSectionKarty from '../components/FeaturesSectionKarty';
import ProductShowcaseKarty from '../components/ProductShowcaseKarty';
import KartyCreator from '../components/KartyCreator';

interface HraciKartyPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const HraciKartyPage: React.FC<HraciKartyPageProps> = ({ onAddToCart }) => {
    return (
        <>
            <HeroSectionKarty />
            <FeaturesSectionKarty />
            <ProductShowcaseKarty onAddToCart={onAddToCart} />
            {/* <KartyCreator onAddToCart={onAddToCart} /> */}
        </>
    );
};

export default HraciKartyPage;
