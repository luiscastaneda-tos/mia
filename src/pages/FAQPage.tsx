import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Building2, Briefcase, CreditCard, MessageSquare, Globe, Rocket, Shield, DollarSign, Users, Sparkles } from 'lucide-react';

interface FAQSection {
  title: string;
  icon: React.FC<{ className?: string }>;
  questions: {
    question: string;
    answer: string | string[];
  }[];
}

interface FAQPageProps {
  onBack: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [openQuestions, setOpenQuestions] = useState<{ [key: string]: boolean }>({});

  const sections: FAQSection[] = [
    {
      title: "Sobre Noktos",
      icon: Building2,
      questions: [
        {
          question: "¿Qué es Noktos?",
          answer: "Noktos es una empresa de tecnología enfocada en la industria de los viajes corporativos (TravelTech). Su objetivo principal es simplificar, optimizar y hacer más accesible la gestión de viajes para pequeñas y medianas empresas (PyMEs). Ofrece herramientas y modelos de precios que eliminan la incertidumbre y los procesos complicados, permitiendo que las empresas ahorren tiempo y dinero."
        },
        {
          question: "¿Cuál es la visión de Noktos?",
          answer: "Convertirse en el líder en la gestión de viajes corporativos en América Latina, ofreciendo herramientas accesibles, innovadoras y altamente personalizadas que permitan a las PyMEs crecer y operar con mayor eficiencia."
        }
      ]
    },
    {
      title: "Servicios y Soluciones",
      icon: Briefcase,
      questions: [
        {
          question: "¿Qué es la Canasta de Precios Fijos?",
          answer: [
            "La Canasta de Precios Fijos es un modelo exclusivo de Noktos que:",
            "• Ofrece tarifas pre-negociadas con precios fijos",
            "• Elimina la volatilidad en los costos de hospedaje",
            "• Optimiza la planificación de presupuestos de viaje"
          ]
        },
        {
          question: "¿Cuáles son los productos clave de Noktos?",
          answer: [
            "1. Canasta de Precios Fijos: Hoteles con tarifas pre-negociadas",
            "2. Productos Tradicionales: Reservas estándar",
            "3. Planes de Financiamiento: Flexibilidad para pagar en cuotas",
            "4. Futuro: Integración de vuelos y autos de renta"
          ]
        }
      ]
    },
    {
      title: "Asistente Virtual Mia",
      icon: MessageSquare,
      questions: [
        {
          question: "¿Qué es 'Pídeselo a Mia'?",
          answer: [
            "'Pídeselo a Mia' es un asistente virtual impulsado por inteligencia artificial diseñado para:",
            "• Simplificar la gestión de viajes corporativos",
            "• Responder a solicitudes como reservas y reportes",
            "• Ofrecer sugerencias personalizadas",
            "• Integrar múltiples funciones en una sola plataforma"
          ]
        },
        {
          question: "¿Cómo Mia ayuda a las PyMEs?",
          answer: [
            "Mia resuelve problemas clave en viajes corporativos:",
            "• Facturación Consolidada",
            "• Control de Gastos en tiempo real",
            "• Reportes Automatizados",
            "• Opciones de Pago Flexibles",
            "• Ahorro de Tiempo en reservas"
          ]
        }
      ]
    },
    {
      title: "Tecnología e Innovación",
      icon: Rocket,
      questions: [
        {
          question: "¿Qué significa ser una TravelTech?",
          answer: [
            "TravelTech es un sector que utiliza tecnología avanzada para transformar la industria de los viajes. Noktos se destaca porque:",
            "• Aplica Innovación en modelos de precios y asistentes virtuales",
            "• Facilita la Gestión integrando procesos complejos",
            "• Se enfoca en resolver necesidades específicas de PyMEs"
          ]
        }
      ]
    },
    {
      title: "Seguridad y Privacidad",
      icon: Shield,
      questions: [
        {
          question: "¿Cómo protege Noktos los datos de sus clientes?",
          answer: [
            "Noktos implementa múltiples capas de seguridad:",
            "• Encriptación de datos sensibles",
            "• Autenticación segura",
            "• Monitoreo continuo",
            "• Cumplimiento con regulaciones de privacidad"
          ]
        }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleQuestion = (id: string) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return (
        <ul className="space-y-2">
          {answer.map((item, index) => (
            <li key={index} className="text-gray-600">{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-gray-600">{answer}</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre Noktos y nuestros servicios
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Building2, text: "Sobre Noktos" },
            { icon: CreditCard, text: "Pagos y Facturación" },
            { icon: Users, text: "Servicio al Cliente" },
            { icon: Sparkles, text: "Características" }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <item.icon className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-white font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.title)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  {openSections[section.title] ? (
                    <Minus className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {openSections[section.title] && (
                <div className="border-t border-gray-100">
                  {section.questions.map((q, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-b-0">
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleQuestion(`${section.title}-${index}`)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">
                            {q.question}
                          </h4>
                          {openQuestions[`${section.title}-${index}`] ? (
                            <Minus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        {openQuestions[`${section.title}-${index}`] && (
                          <div className="mt-4">
                            {renderAnswer(q.answer)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-white/80 mb-6">
            Nuestro equipo está aquí para ayudarte con cualquier pregunta adicional
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
};