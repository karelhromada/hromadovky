import React from 'react';
import type { CartItem } from '../App';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import HeroSectionKarty from '../components/HeroSectionKarty';
import FeaturesSectionKarty from '../components/FeaturesSectionKarty';
import ProductShowcaseKarty from '../components/ProductShowcaseKarty';
import FamilyCardConfigurator from '../components/FamilyCardConfigurator';

import { useLocation } from 'react-router-dom';

interface HraciKartyPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const HraciKartyPage: React.FC<HraciKartyPageProps> = ({ onAddToCart }) => {
    const { hash } = useLocation();

    React.useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <>
            <PageHead {...SEO.karty} />
            <HeroSectionKarty />
            <FeaturesSectionKarty />
            <ProductShowcaseKarty onAddToCart={onAddToCart} />
            <FamilyCardConfigurator onAddToCart={onAddToCart} />
        </>
    );
};

export default HraciKartyPage;
