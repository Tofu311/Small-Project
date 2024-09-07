<?php

    $inData = getRequestInfo();
    
    $firstname = $inData["firstname"];
    $lastname = $inData["lastname"];
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            returnWithError("Invalid email format");
            exit();
         }

        $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Name, Phone, Email, UserID) VALUES (?,?,?, ?, ?, ?)");
        $stmt->bind_param("sssssi",$firstname,$lastname,$name, $phone, $email, $userID);

        if($stmt->execute())
        {
            returnWithInfo("Contact added successfully.");
        }
        else
        {
            returnWithError("Error adding contact: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    function returnWithInfo( $info )
    {
        $retValue = '{"result":"' . $info .'","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
