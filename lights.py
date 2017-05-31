import pigpio
import sys
import time

mode = sys.argv[1]
pi = pigpio.pi()

RED_PIN = 4
GREEN_PIN = 17
BLUE_PIN = 18

def fadeTo(r1,g1,b1,r2,g2,b2,t,divs):
    dr = (r2 - r1)//divs
    dg = (g2 - g1)//divs
    db = (b2 - b1)//divs
    dt = t/divs

    for i in range(1, divs):
        if (r1+dr*i) > 0 and (r1+dr*i) < 256:
            pi.set_PWM_dutycycle(RED_PIN,r1+dr*i)
        if (g1+dg*i) > 0 and (g1+dg*i) < 256:
            pi.set_PWM_dutycycle(GREEN_PIN,g1+dg*i)
        if (b1+db*i) > 0 and (b1+db*i) < 256:
            pi.set_PWM_dutycycle(BLUE_PIN,b1+db*i)
        time.sleep(dt)
        
    pi.set_PWM_dutycycle(RED_PIN,r2)
    pi.set_PWM_dutycycle(GREEN_PIN,g2)
    pi.set_PWM_dutycycle(BLUE_PIN,b2)

def party(t,divs):
    fadeTo(0,0,0,0,0,255,t,divs)
    while True:
        fadeTo(0,0,255,255,0,0,t,divs)
        fadeTo(255,0,0,0,255,0,t,divs)
        fadeTo(0,255,0,0,0,255,t,divs)

if mode=="fade":
    fadeTo(int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5]),int(sys.argv[6]),int(sys.argv[7]),float(sys.argv[8]),int(sys.argv[9]))
if mode=="party":
    party(float(sys.argv[2]),int(sys.argv[3]))
