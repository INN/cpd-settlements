def format_currency(amount):
    if not amount:
        amount = '0'
    return '${:,.2f}'.format(int(amount))


def total_for_payments(payments, format=True):
    total = 0
    for payment in payments:
        if payment.payment:
            total += payment.payment
    if format:
        return format_currency(total)
    else:
        return total
