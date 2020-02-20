import React, { useState } from 'react'
import './App.css'
import Joi from '@hapi/joi'

const useForm = ({ schema = null } = {}) => {
  const [state, setState] = useState({
    formState: {},
    errors: {},
    listeners: {}
  })

  const parseErrors = (errors) => {
    return errors.details.reduce((x, u) => {
      x[u.path[0]] = u.message
      return x
    }, {})
  }

  const JoiSchema = Joi.object(schema)

  // Check if the provided schema is valid
  if (!Joi.isSchema(JoiSchema)) {
    throw new Error('The provided Joi schema is invalid')
  }

  const validateForm = (e) => {
    e.preventDefault()
    const data = Array.from(new FormData(e.target).entries())
      .reduce((x, u) => { x[u[0]] = u[1]; return x }, {})

    if (schema) {
      const { error, value } = JoiSchema.validate(data, { abortEarly: false })

      if (error) {
        const errors = parseErrors(error)
        setState({ ...state, errors, formState: value })
      } else {
        setState({ ...state, formState: value, errors: {} })
      }
    } else {
      setState({ ...state, formState: data })
    }
  }

  const validateInput = ({ target }) => {
    if (schema && !state.listeners[target.name]) {
      target.addEventListener('blur', () => {
        // Check if input should be validated
        if (!schema[target.name]) {
          return true
        }

        // retreive the key that will be validated from the object
        const joiSchema = Joi.object({ [target.name]: schema[target.name] })
        const { error } = joiSchema.validate({ [target.name]: target.value })

        if (error) {
          const errors = parseErrors(error)
          setState({
            ...state,
            errors: { ...state.errors, ...errors },
            listeners: { ...state.listeners, [target.name]: false }
          })
        } else {
          const errors = state.errors
          delete errors[target.name]
          setState({
            ...state,
            listeners: { ...state.listeners, [target.name]: false },
            errors
          })
        }
      }, { once: true })

      setState({ ...state, listeners: { ...state.listeners, [target.name]: true } })
    }
  }

  return [{ validateForm, validateInput }, state.formState, state.errors]
}

function App () {
  const validation = {
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
  }

  const [{ validateForm, validateInput }, formState, error] = useForm({
    schema: validation
  })

  console.log(error, formState)

  return (
    <div className='App'>
      <form action='/' onSubmit={validateForm} onFocus={validateInput}>
        <h1>Complaint Form</h1>
        <p>Please send us details about the incident you would like to report. Our Complaint Center will analyze your complaint and take the appropriate measures in order that the reported situation will not occur at any other time in the future.</p>
        <hr />
        <div className='item'>
          <p>Date of complaint</p>
          <input type='date' name='date' />
          <i className='fas fa-calendar-alt' />
        </div>
        <div className='item'>
          <p>Name</p>
          <input type='text' name='firstName' placeholder='First' />
          <input type='text' name='lastName' placeholder='Last' />
        </div>
        <div className='item'>
          <p>Email</p>
          <input type='text' name='email' />
        </div>
        <div className='item address'>
          <p>Address</p>
          <div className='street'>
            <input className='street-item' type='text' name='address1' placeholder='Street address' />
            <input className='street-item' type='text' name='address2' placeholder='Street addres line 2' />
            <input type='text' name='city' placeholder='City' />
            <input type='text' name='region' placeholder='Region' />
            <input type='text' name='zipcode' placeholder='Postal / zip code' />
            <select name='country'>
              <option value=''>Country</option>
              <option value='1'>Russia</option>
              <option value='2'>Germany</option>
              <option value='3'>France</option>
              <option value='4'>Armenia</option>
              <option value='5'>USA</option>
            </select>
          </div>
        </div>
        <div className='item'>
          <p>Date of the reported incident</p>
          <input type='date' name='date2' />
          <i className='fas fa-calendar-alt' />
        </div>
        <div className='item location'>
          <p>Incident location</p>
          <input type='text' name='location' />
        </div>
        <div className='item complaint-details'>
          <p>Complaint details</p>
          <div className='complaint-details-item'>
            <textarea rows='5' name='details' />
          </div>
        </div>
        <div className='item desired-outcome'>
          <p>Desired outcome</p>
          <div className='desired-outcome-item'>
            <textarea rows='5' name='details2' />
            <small>By signing you declare that all information you have entered is truthful and accurate.</small>
          </div>
        </div>
        <h4>Your signature</h4>
        <textarea rows='5' />
        <small>By signing you declare that all information you have entered is truthful and accurate.</small>
        <div className='btn-block'>
          <button type='submit' href='/'>Send</button>
        </div>
      </form>
    </div>
  )
}

export default App
