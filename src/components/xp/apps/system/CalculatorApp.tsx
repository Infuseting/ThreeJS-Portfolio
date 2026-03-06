'use client'

import { useState } from 'react'
import { withBaseApp } from '@/components/xp/infrastructure/hoc/withBaseApp'
import { unlockAchievement } from '@/components/stores/AchievementStore'

function CalculatorContent() {
    const [display, setDisplay] = useState('0')
    const [storedValue, setStoredValue] = useState<number | null>(null)
    const [operator, setOperator] = useState<string | null>(null)
    const [waitingForNewValue, setWaitingForNewValue] = useState(false)

    const handleNum = (num: string) => {
        if (waitingForNewValue) {
            setDisplay(num)
            setWaitingForNewValue(false)
        } else {
            setDisplay(display === '0' ? num : display + num)
        }
    }

    const handleOp = (op: string) => {
        if (operator && !waitingForNewValue) {
            calculate()
        } else {
            setStoredValue(parseFloat(display))
        }
        setOperator(op)
        setWaitingForNewValue(true)
    }

    const calculate = () => {
        if (operator === null || storedValue === null) return

        const current = parseFloat(display)
        let result = 0

        switch (operator) {
            case '+': result = storedValue + current; break
            case '-': result = storedValue - current; break
            case '*': result = storedValue * current; break
            case '/':
                if (current === 0) {
                    unlockAchievement('calcul-mental')
                    setDisplay('Division par zéro impossible')
                    setStoredValue(null)
                    setOperator(null)
                    setWaitingForNewValue(true)
                    return
                }
                result = storedValue / current
                break
        }

        // Limit display precision if necessary
        const displayResult = String(Number.isInteger(result) ? result : parseFloat(result.toFixed(8)))
        setDisplay(displayResult)
        setStoredValue(result)
        setOperator(null)
        setWaitingForNewValue(true)
    }

    const handleClear = () => {
        setDisplay('0')
        setStoredValue(null)
        setOperator(null)
        setWaitingForNewValue(false)
    }

    const handleClearEntry = () => {
        setDisplay('0')
    }

    const btnStyle = {
        flex: 1,
        padding: '8px 0',
        margin: '3px',
        backgroundColor: '#ECE9D8',
        border: '1px outset #fff',
        borderRadius: '3px',
        cursor: 'pointer',
        fontWeight: 'normal',
        color: '#000',
        fontFamily: 'Tahoma, Arial',
        fontSize: '14px',
        boxShadow: 'inset -1px -1px #aca899, inset 1px 1px #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }

    const btnRedStyle = { ...btnStyle, color: '#ff0000' }
    const btnBlueStyle = { ...btnStyle, color: '#0000ff' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px', backgroundColor: '#ECE9D8', fontFamily: 'Tahoma, Arial', userSelect: 'none' }}>
            <div style={{
                marginBottom: '10px',
                border: '2px inset #fff',
                backgroundColor: '#fff',
                padding: '5px 10px',
                textAlign: 'right',
                fontSize: '24px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                boxSizing: 'border-box',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)'
            }}>
                {display}
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', justifyContent: 'flex-end', paddingRight: '3px' }}>
                <button style={{ ...btnRedStyle, width: '65px', flex: 'none' }} onClick={handleClearEntry}>CE</button>
                <button style={{ ...btnRedStyle, width: '65px', flex: 'none' }} onClick={handleClear}>C</button>
            </div>

            <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <div style={{ display: 'flex', flex: 1 }}>
                    <button style={btnBlueStyle} onClick={() => handleNum('7')}>7</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('8')}>8</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('9')}>9</button>
                    <button style={btnRedStyle} onClick={() => handleOp('/')}>/</button>
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                    <button style={btnBlueStyle} onClick={() => handleNum('4')}>4</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('5')}>5</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('6')}>6</button>
                    <button style={btnRedStyle} onClick={() => handleOp('*')}>*</button>
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                    <button style={btnBlueStyle} onClick={() => handleNum('1')}>1</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('2')}>2</button>
                    <button style={btnBlueStyle} onClick={() => handleNum('3')}>3</button>
                    <button style={btnRedStyle} onClick={() => handleOp('-')}>-</button>
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                    <button style={btnBlueStyle} onClick={() => handleNum('0')}>0</button>
                    <button style={btnBlueStyle} onClick={() => { if (!display.includes('.')) handleNum('.') }}>,</button>
                    <button style={btnRedStyle} onClick={calculate}>=</button>
                    <button style={btnRedStyle} onClick={() => handleOp('+')}>+</button>
                </div>
            </div>
        </div>
    )
}

export const CalculatorApp = withBaseApp(CalculatorContent, {
    backgroundColor: '#ECE9D8',
    alertTitle: 'Calculatrice',
    showAlert: false,
})
