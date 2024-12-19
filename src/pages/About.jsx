import { LightBulbIcon, ShieldCheckIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/outline';

export default function About() {
  const features = [
    {
      name: 'Quality Products',
      description: 'We offer only the highest quality electrical products from trusted manufacturers.',
      icon: LightBulbIcon,
    },
    {
      name: 'Expert Team',
      description: 'Our team of experienced professionals ensures you get the best service and support.',
      icon: UserGroupIcon,
    },
    {
      name: 'Safety First',
      description: 'All our products meet or exceed safety standards and regulations.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Innovation',
      description: 'We stay ahead with the latest electrical technology and smart home solutions.',
      icon: SparklesIcon,
    },
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About Volt Electricals
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Leading the way in electrical solutions since 2010
          </p>
        </div>

        <div className="mt-10">
          <div className="max-w-3xl mx-auto text-center text-gray-500">
            <p className="text-lg leading-relaxed">
              At Volt Electricals, we're passionate about providing high-quality electrical products
              and solutions for homes and businesses. With over a decade of experience, we've
              established ourselves as a trusted name in the electrical industry.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              Our commitment to excellence, innovation, and customer satisfaction drives everything
              we do. We believe in offering not just products, but complete electrical solutions
              that make your life easier and safer.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-md bg-blue-500 p-3 shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 