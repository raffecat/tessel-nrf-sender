tessel-nrf-sender
=================

Send light level via NRF24 module, toggle on sound event.

Requires a Tessel with the rf-nrf24 and ambient-attx4 modules.

* rf-nrf24 in port C
* ambient-attx4 in port D

The program reads the ambient light level once per second (or two) and transmits
the level in the range 0-255 to the receiver device. Any loud sound, such as a clap,
will toggle the light on and off.

See https://github.com/SomeoneWeird/tessel-nrf-receiver

The receiver controls an LED using a GPIO output pin in PWM mode.
The LED brightness is greater when the received light level is small; i.e. a night light.

Note: the rate of transimit is quite low - the world's slowest light switch -
because otherwise the RF modules end up with queued messages, causing increasing lag
between light level changes and LED updates.
