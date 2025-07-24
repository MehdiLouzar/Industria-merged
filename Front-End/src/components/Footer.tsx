'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Phone, Calendar, Mail, Facebook, Youtube, Instagram, Twitter, Building2 } from 'lucide-react';
import AppointmentForm from './AppointmentForm';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showForm, setShowForm] = useState(false);

  const productLinks = [
    { title: 'Zones Industrielles', href: '/zones' },
    { title: 'Parcs Logistiques', href: '/logistique' },
    { title: 'Zones Franches', href: '/zones-franches' },
    { title: 'Catalogues', href: '/catalogues' },
  ];

  const serviceLinks = [
    { title: 'Service Client B2B', href: '/support' },
    { title: 'Prise de Rendez-vous', href: '/rdv' },
    { title: 'Simulation de Coûts', href: '/simulation' },
    { title: 'Demandes d\'Informations', href: '/contact' },
    { title: 'Appels d\'Offres', href: '/offres' },
  ];

  const supportLinks = [
    { title: 'Déposer une Demande', href: '/support/demande' },
    { title: 'Suivi des Demandes', href: '/support/suivi' },
  ];

  const networkLinks = [
    { title: 'Région Casablanca-Settat', href: '/casablanca' },
    { title: 'Région Rabat-Salé-Kénitra', href: '/rabat' },
    { title: 'Région Fès-Meknès', href: '/fes' },
    { title: 'Région Marrakech-Safi', href: '/marrakech' },
    { title: 'Région Tanger-Tétouan', href: '/tanger' },
    { title: 'Région Souss-Massa', href: '/agadir' },
    { title: 'Région Oriental', href: '/oriental' },
    { title: 'Région Darâa-Tafilalet', href: '/daraa' },
    { title: 'Région Beni Mellal-Khénifra', href: '/beni-mellal' },
    { title: 'Région Rabat-Salé-Kénitra', href: '/rabat' },
  ];

  const mediaLinks = [
    { title: 'Communiqués de presse', href: '/media/communiques' },
    { title: 'Actualités', href: '/media/actualites' },
    { title: 'Rapports', href: '/media/rapports' },
  ];

  const groupLinks = [
    { title: 'À propos', href: '/groupe/a-propos' },
    { title: 'Chiffres clés', href: '/groupe/chiffres' },
    { title: 'Engagement citoyen', href: '/groupe/engagement' },
    { title: 'Offre d\'emplois', href: '/groupe/emplois' },
    { title: 'Candidature', href: '/groupe/candidature' },
    { title: 'Politique de recrutement', href: '/groupe/recrutement' },
  ];

  return (
    <>
    <footer className="bg-gray-800 text-white">
      {/* Action buttons */}
      <div className="bg-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-gray-600 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Appel (Centre d'appel)
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-600 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Être contacté
            </Button>
            <Button
              className="header-red text-white hover:opacity-90 flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <Calendar className="w-5 h-5" />
              Prise de rendez-vous
            </Button>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Nos Zones */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nos Zones</h3>
            <ul className="space-y-2">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services B2B */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services B2B</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Notre Réseau */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notre Réseau</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {networkLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-600" />

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Média */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Média</h3>
            <ul className="space-y-2">
              {mediaLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Le Groupe */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Le Groupe</h3>
            <ul className="space-y-2">
              {groupLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Contactez-nous sur</h4>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span className="text-xl font-bold">+212 5 37 57 20 00</span>
              </div>
              <Button
                className="w-full header-red text-white hover:opacity-90 mt-3"
                onClick={() => setShowForm(true)}
              >
                Prise de rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building2 className="w-6 h-6 text-red-400" />
              <span className="text-sm">© ZONES-PRO {currentYear} - Powered by ZonesPro</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a href="/actualites" className="text-gray-300 hover:text-white">Actualités</a>
              <a href="/evenements" className="text-gray-300 hover:text-white">Événements</a>
              <a href="/mediatheque" className="text-gray-300 hover:text-white">Médiathèque</a>
              <a href="/contact" className="text-gray-300 hover:text-white">Contactez nous</a>
              <a href="/sitemap" className="text-gray-300 hover:text-white">Plan de site</a>
              <a href="/faq" className="text-gray-300 hover:text-white">FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    {showForm && <AppointmentForm onClose={() => setShowForm(false)} />}
    </>
  );
}
