import { useEffect } from "react";

declare global {
  interface Window {
    setmoreIframe?: any;
  }
}

export default function Booking() {
  useEffect(() => {
    // Load Setmore script
    const script = document.createElement('script');
    script.id = 'setmore_script';
    script.type = 'text/javascript';
    script.src = 'https://assets.setmore.com/integration/static/setmoreIframeLive.js';
    script.async = true;
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('setmore_script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience professional massage therapy and personal training in the comfort of your own home
          </p>
        </div>
        
        {/* Setmore Booking Widget */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Schedule Your Session with Carol
            </h2>
            <p className="text-muted-foreground mb-8">
              Click the button below to view available appointments and book your preferred time slot.
            </p>
            
            {/* Setmore Button with Custom Styling */}
            <div className="inline-block">
              <a 
                id="Setmore_button_iframe" 
                href="https://kamalamassage.setmore.com"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                📅 Book Your Appointment Now
              </a>
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                You'll be redirected to our secure booking system where you can:
              </p>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• View real-time availability</li>
                <li>• Choose your preferred service</li>
                <li>• Select date and time</li>
                <li>• Receive instant confirmation</li>
              </ul>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Need help with booking? Call Carol directly at{" "}
              <a 
                href="tel:+12192993846" 
                className="text-primary hover:underline font-medium"
              >
                (219) 299-3846
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}