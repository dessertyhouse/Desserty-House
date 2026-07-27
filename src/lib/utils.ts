import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function generateWhatsAppLink(phone: string, items: any[], totalPrice: number) {
  const message = `Hello Desserty House! I'd like to place an order:
${items.map(item => `- ${item.quantity}x ${item.title} ($${(item.price * item.quantity).toFixed(2)})`).join('\n')}
Total: $${totalPrice.toFixed(2)}
Delivery Address: [Enter Your Address Here]`

  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
}

export function generateEmailLink(email: string, items: any[], totalPrice: number) {
  const subject = "New Order Inquiry - Desserty House"
  const body = `Hello Desserty House! I'd like to place an order:

${items.map(item => `- ${item.quantity}x ${item.title} ($${(item.price * item.quantity).toFixed(2)})`).join('\n')}

Total: $${totalPrice.toFixed(2)}

Delivery Address: [Enter Your Address Here]`

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
